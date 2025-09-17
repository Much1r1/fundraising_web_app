import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  TrendingUp,
  Activity,
  Users,
  Flag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "duplicate_content" | "suspicious_activity" | "fake_documents" | "rapid_campaigns";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  entityId: string;
  entityType: "campaign" | "user";
  timestamp: string;
  status: "active" | "investigating" | "resolved";
}

const fraudAlerts: Alert[] = [
  {
    id: "1",
    type: "duplicate_content",
    severity: "high",
    title: "Duplicate Campaign Content Detected",
    description: "Campaign story matches 85% with existing campaign from different user",
    entityId: "camp_123",
    entityType: "campaign",
    timestamp: "2024-01-15T10:30:00Z",
    status: "active"
  },
  {
    id: "2", 
    type: "suspicious_activity",
    severity: "high",
    title: "Unusual Donation Pattern",
    description: "Multiple large donations from same IP address within 5 minutes",
    entityId: "user_456",
    entityType: "user",
    timestamp: "2024-01-15T09:15:00Z",
    status: "investigating"
  },
  {
    id: "3",
    type: "fake_documents",
    severity: "medium",
    title: "Document Verification Failed",
    description: "Uploaded medical documents appear to be digitally altered",
    entityId: "camp_789",
    entityType: "campaign",
    timestamp: "2024-01-15T08:45:00Z", 
    status: "active"
  },
  {
    id: "4",
    type: "rapid_campaigns",
    severity: "medium",
    title: "Rapid Campaign Creation",
    description: "User created 5 campaigns in 24 hours with similar content",
    entityId: "user_321",
    entityType: "user",
    timestamp: "2024-01-15T07:20:00Z",
    status: "resolved"
  }
];

export function FraudDetectionPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(fraudAlerts);
  const { toast } = useToast();

  const handleAlertAction = (alertId: string, action: "investigate" | "resolve" | "escalate") => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === "resolve" ? "resolved" : "investigating" }
        : alert
    ));

    toast({
      title: "Alert Updated",
      description: `Alert has been marked as ${action === "resolve" ? "resolved" : "under investigation"}.`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive bg-destructive/10";
      case "medium": return "text-warning bg-warning/10";
      case "low": return "text-success bg-success/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-destructive";
      case "investigating": return "text-warning";
      case "resolved": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const activeAlerts = alerts.filter(a => a.status === "active").length;
  const investigatingAlerts = alerts.filter(a => a.status === "investigating").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Eye className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{investigatingAlerts}</div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2.1%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positives</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">-1.2%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Detection Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist Management</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
              <CardDescription>Real-time fraud detection alerts requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity} priority
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {alert.entityType} • {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                        <p className="text-sm font-mono text-muted-foreground">
                          ID: {alert.entityId}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === "active" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAlertAction(alert.id, "investigate")}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Investigate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleAlertAction(alert.id, "escalate")}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Block
                            </Button>
                          </>
                        )}
                        {alert.status === "investigating" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAlertAction(alert.id, "resolve")}
                            className="bg-success hover:bg-success/90"
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Patterns</CardTitle>
                <CardDescription>Detected fraud patterns in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Duplicate Content</span>
                      <span>23 cases</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Suspicious Donations</span>
                      <span>18 cases</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Document Fraud</span>
                      <span>12 cases</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Account Farming</span>
                      <span>8 cases</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ML Model Performance</CardTitle>
                <CardDescription>Fraud detection model metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">94.2%</div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">89.7%</div>
                    <p className="text-sm text-muted-foreground">Precision</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">91.3%</div>
                    <p className="text-sm text-muted-foreground">Recall</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">5.8%</div>
                    <p className="text-sm text-muted-foreground">False Positive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blacklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blacklist Management</CardTitle>
              <CardDescription>Manage blocked users, IPs, and suspicious patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Blacklist management interface would go here</p>
                <p className="text-sm mt-2">Features: IP blocking, user banning, pattern-based rules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}