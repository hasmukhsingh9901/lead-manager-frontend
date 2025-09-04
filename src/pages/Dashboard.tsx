import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Clock, Target, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchLeads, type Lead } from "@/services/leads";

// Using Lead type from services

const Dashboard = () => {
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
  const { data: statsData } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    if (searchTerm) {
      filtered = filtered.filter((lead) =>
        [lead.firstName, lead.lastName, lead.email, lead.company || ""].some((v) =>
          String(v || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sourceFilter !== "all") {
      filtered = filtered.filter((lead) => (lead.source || "") === sourceFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => (lead.status || "").toLowerCase() === statusFilter.toLowerCase());
    }
    return filtered;
  }, [leads, searchTerm, sourceFilter, statusFilter]);

  const totalLeads = leads.length;
  const newLeads = (statsData?.newLeads) ?? filteredLeads.filter(l => (l.status || '').toLowerCase() === 'new').length;
  const qualifiedLeads = (statsData?.qualifiedLeads) ?? filteredLeads.filter(l => (l.status || '').toLowerCase() === 'qualified').length;
  const conversionRate = (statsData?.conversionRate !== undefined) ? Math.round(statsData.conversionRate) : (totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      description: "All captured leads"
    },
    {
      title: "New Leads",
      value: newLeads,
      icon: Clock,
      description: "Requiring attention"
    },
    {
      title: "Qualified",
      value: qualifiedLeads,
      icon: Target,
      description: "Ready for conversion"
    },
    {
      title: "Conversion Rate",
      value: conversionRate,
      icon: TrendingUp,
      description: "Success percentage",
      suffix: "%"
    }
  ];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Leads Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Monitor and manage your lead pipeline effectively.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card border-0 bg-gradient-card backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-card border-0 bg-gradient-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Leads
            </CardTitle>
            <CardDescription>
              Search and filter your leads to find what you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50"
                  />
                </div>
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/50">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="shadow-card border-0 bg-gradient-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>
              Complete list of your captured leads with their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No leads found</p>
                <p className="text-sm text-muted-foreground">
                  {leads.length === 0 
                    ? "Start by capturing your first lead!" 
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead._id || lead.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                        <TableCell className="capitalize">
                          {(lead.source || '').replace('-', ' ') || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status || 'New')}>
                            {lead.status || 'New'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;