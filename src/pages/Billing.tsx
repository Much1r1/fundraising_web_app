import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  PlusCircle,
  ArrowLeft,
  AlertCircle,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BillingPage = () => {
  const navigate = useNavigate();

  // You can later replace these with live data from Supabase or Stripe
  const cards: any[] = [];
  const billingHistory: any[] = [];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Billing</h1>
          <Button variant="outline" onClick={() => navigate("profile/billing")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Payment Methods */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {cards.length > 0 ? (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {card.brand} •••• {card.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {card.exp}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.isDefault ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <Star className="w-4 h-4 mr-1 fill-green-600" /> Default
                      </span>
                    ) : (
                      <Button size="sm" variant="outline">
                        Set as Default
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-6">
                No payment methods yet.
              </div>
            )}

            <Button
              variant="outline"
              className="w-fit"
              onClick={() => navigate("/billing/addCard")}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Card
            </Button>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            {billingHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>{bill.invoice}</TableCell>
                      <TableCell>{bill.amount}</TableCell>
                      <TableCell>
                        {bill.status === "Paid" ? (
                          <span className="text-green-600 font-medium">
                            Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 font-medium">
                            <AlertCircle className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                No billing history yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingPage;
