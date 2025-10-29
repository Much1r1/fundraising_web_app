import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Conversation {
  id: string;
  user_name: string;
  user_email: string;
  status: string;
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
}

export const ChatManagement = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "general" });

  useEffect(() => {
    loadConversations();
    loadFAQs();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv);
      subscribeToMessages(selectedConv);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    // @ts-ignore
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  const loadMessages = async (convId: string) => {
    // @ts-ignore
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`admin-chat:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendAdminReply = async () => {
    if (!replyMessage.trim() || !selectedConv) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: selectedConv,
      message: replyMessage,
      sender_type: "admin",
      sender_id: user?.id,
    });

    if (!error) {
      setReplyMessage("");
      toast({ description: "Reply sent successfully" });
    } else {
      toast({ description: "Failed to send reply", variant: "destructive" });
    }
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id);

    if (!error) {
      loadConversations();
      if (selectedConv === id) {
        setSelectedConv(null);
        setMessages([]);
      }
      toast({ description: "Conversation deleted" });
    }
  };

  const loadFAQs = async () => {
    // @ts-ignore
    const { data, error } = await supabase
      .from("chat_faq")
      .select("*")
      .order("priority", { ascending: false });

    if (!error && data) {
      setFaqs(data);
    }
  };

  const createFAQ = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast({ description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("chat_faq").insert(newFaq);

    if (!error) {
      loadFAQs();
      setNewFaq({ question: "", answer: "", category: "general" });
      toast({ description: "FAQ created successfully" });
    }
  };

  const toggleFAQStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("chat_faq")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      loadFAQs();
    }
  };

  const deleteFAQ = async (id: string) => {
    const { error } = await supabase.from("chat_faq").delete().eq("id", id);

    if (!error) {
      loadFAQs();
      toast({ description: "FAQ deleted" });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="conversations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conversations">
            <MessageSquare className="w-4 h-4 mr-2" />
            Conversations ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Conversation List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">All Chats</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted transition ${
                        selectedConv === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{conv.user_name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.user_email || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conv.last_message_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Badge className="mt-2" variant={conv.status === "active" ? "default" : "secondary"}>
                        {conv.status}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedConv ? "Chat Messages" : "Select a conversation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConv ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${
                              msg.sender_type === "user" ? "justify-start" : "justify-end"
                            }`}
                          >
                            {msg.sender_type === "user" && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="text-xs">U</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col max-w-[75%]">
                              <div
                                className={`rounded-lg p-3 ${
                                  msg.sender_type === "user"
                                    ? "bg-muted"
                                    : msg.sender_type === "admin"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary"
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            {msg.sender_type !== "user" && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {msg.sender_type === "admin" ? "A" : "B"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2 pt-4 border-t">
                      <Input
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendAdminReply()}
                        placeholder="Type admin reply..."
                      />
                      <Button onClick={sendAdminReply} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    Select a conversation to view messages
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>FAQ Management</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New FAQ</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={newFaq.category}
                        onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                        placeholder="e.g., donations, campaigns"
                      />
                    </div>
                    <div>
                      <Label>Question</Label>
                      <Input
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        placeholder="Enter question"
                      />
                    </div>
                    <div>
                      <Label>Answer</Label>
                      <Textarea
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        placeholder="Enter answer"
                        rows={4}
                      />
                    </div>
                    <Button onClick={createFAQ} className="w-full">
                      Create FAQ
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{faq.category}</Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFAQStatus(faq.id, faq.is_active)}
                        >
                          {faq.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFAQ(faq.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    <Badge className="mt-2" variant={faq.is_active ? "default" : "secondary"}>
                      {faq.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
