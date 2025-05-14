
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  BarChart3,
  Activity,
  Library,
  Lock,
  Timer,
  Settings,
  Search,
  Calendar
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, authenticate against a backend
    if (username === "admin" && password === "password") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials. For demo, use admin/password");
    }
  };

  if (!isLoggedIn) {
    return (
      <MainLayout className="flex items-center justify-center">
        <div className="vr-card max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-vr-muted">Sign in to access the admin dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input 
                id="username"
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username"
                className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input 
                id="password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                required
              />
            </div>
            <Button type="submit" className="vr-button w-full">
              Login
            </Button>
          </form>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-vr-muted">Manage your VR kiosk system</p>
        </div>
        <Button 
          variant="outline"
          className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20"
          onClick={() => setIsLoggedIn(false)}
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <div className="flex overflow-auto pb-2 mb-4">
          <TabsList className="bg-vr-dark border border-vr-primary/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-vr-primary gap-2">
              <Activity size={16} />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-vr-primary gap-2">
              <Library size={16} />
              <span>Games</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-vr-primary gap-2">
              <Timer size={16} />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-vr-primary gap-2">
              <Users size={16} />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-vr-primary gap-2">
              <Settings size={16} />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="games" className="m-0">
          <GamesManagementTab />
        </TabsContent>

        <TabsContent value="sessions" className="m-0">
          <div className="vr-card">
            <h2 className="text-xl font-bold mb-4">Session Management</h2>
            <p className="text-vr-muted">This section would contain session logs and management features.</p>
          </div>
        </TabsContent>

        <TabsContent value="users" className="m-0">
          <div className="vr-card">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <p className="text-vr-muted">This section would contain user management features.</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="m-0">
          <div className="vr-card">
            <h2 className="text-xl font-bold mb-4">System Settings</h2>
            <p className="text-vr-muted">This section would contain system settings and configuration.</p>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

const OverviewTab = () => {
  // Mock data for the charts
  const usageData = [
    { name: "Mon", sessions: 12 },
    { name: "Tue", sessions: 19 },
    { name: "Wed", sessions: 15 },
    { name: "Thu", sessions: 22 },
    { name: "Fri", sessions: 30 },
    { name: "Sat", sessions: 45 },
    { name: "Sun", sessions: 38 },
  ];
  
  const popularGamesData = [
    { name: "Beat Saber", value: 35 },
    { name: "Half-Life: Alyx", value: 20 },
    { name: "Superhot VR", value: 18 },
    { name: "Others", value: 27 },
  ];
  
  const COLORS = ["#5D4FFF", "#00EAFF", "#FF3D8B", "#A3A8C3"];
  
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Sessions" 
          value="187" 
          description="This month" 
          trend="+12%" 
          positive 
          icon={<Activity className="h-5 w-5 text-vr-secondary" />}
        />
        <StatsCard 
          title="Revenue" 
          value="$2,845" 
          description="This month" 
          trend="+23%" 
          positive 
          icon={<BarChart3 className="h-5 w-5 text-green-400" />}
        />
        <StatsCard 
          title="Active Users" 
          value="93" 
          description="Unique players" 
          trend="+5%" 
          positive 
          icon={<Users className="h-5 w-5 text-blue-400" />}
        />
        <StatsCard 
          title="Avg. Session" 
          value="32 min" 
          description="Per user" 
          trend="-2%" 
          positive={false} 
          icon={<Timer className="h-5 w-5 text-vr-accent" />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage chart */}
        <Card className="vr-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Usage</span>
              <Button variant="ghost" size="sm" className="text-vr-muted">
                <Calendar className="h-4 w-4 mr-1" />
                May 2025
              </Button>
            </CardTitle>
            <CardDescription>Sessions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1F35" />
                  <XAxis dataKey="name" stroke="#8E9DC0" />
                  <YAxis stroke="#8E9DC0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0B0E18", 
                      borderColor: "#5D4FFF40",
                      borderRadius: "8px"
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke="#5D4FFF"
                    strokeWidth={3}
                    activeDot={{ r: 8, fill: "#00EAFF" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Popular Games chart */}
        <Card className="vr-card">
          <CardHeader>
            <CardTitle>Popular Games</CardTitle>
            <CardDescription>Session distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularGamesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {popularGamesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0B0E18", 
                      borderColor: "#5D4FFF40",
                      borderRadius: "8px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity would go here */}
      <Card className="vr-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest session activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem 
              time="10:32 AM" 
              description="User #124 started Beat Saber" 
              duration="30 min" 
            />
            <ActivityItem 
              time="10:15 AM" 
              description="User #123 completed Half-Life: Alyx" 
              duration="45 min" 
            />
            <ActivityItem 
              time="9:45 AM" 
              description="User #122 started Superhot VR" 
              duration="30 min" 
            />
            <ActivityItem 
              time="9:30 AM" 
              description="Admin updated system settings" 
              duration="" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const GamesManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock games data
  const games = [
    { id: 1, title: "Beat Saber", category: "Rhythm, Action", status: "Available" },
    { id: 2, title: "Half-Life: Alyx", category: "Adventure, Shooter", status: "Available" },
    { id: 3, title: "Superhot VR", category: "Action, Strategy", status: "Available" },
    { id: 4, title: "Moss", category: "Adventure", status: "Maintenance" },
    { id: 5, title: "The Room VR", category: "Puzzle", status: "Available" },
    { id: 6, title: "Star Wars: Squadrons", category: "Simulation", status: "Available" },
  ];
  
  // Filter games based on search term
  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="vr-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Game Library</h2>
        <Button className="vr-button-secondary">
          Add New Game
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vr-muted h-4 w-4" />
        <Input
          placeholder="Search games..."
          className="pl-10 bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-vr-primary/20">
              <th className="py-3 px-4 text-left text-vr-muted font-medium">Game Title</th>
              <th className="py-3 px-4 text-left text-vr-muted font-medium">Category</th>
              <th className="py-3 px-4 text-left text-vr-muted font-medium">Status</th>
              <th className="py-3 px-4 text-right text-vr-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.map(game => (
              <tr key={game.id} className="border-b border-vr-primary/10 hover:bg-vr-dark/50">
                <td className="py-3 px-4 font-medium">{game.title}</td>
                <td className="py-3 px-4 text-vr-muted">{game.category}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    game.status === 'Available' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {game.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-vr-secondary hover:text-vr-secondary/80">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-vr-accent hover:text-vr-accent/80">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {filteredGames.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-vr-muted">
                  No games found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend: string;
  positive: boolean;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, description, trend, positive, icon }: StatsCardProps) => {
  return (
    <Card className="vr-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-vr-muted">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-vr-muted">{description}</p>
          <div className={`text-xs font-medium ${positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  time: string;
  description: string;
  duration: string;
}

const ActivityItem = ({ time, description, duration }: ActivityItemProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-vr-secondary"></div>
        <div className="text-sm font-medium">{time}</div>
        <div className="text-sm text-vr-muted">{description}</div>
      </div>
      {duration && <div className="text-sm text-vr-muted">{duration}</div>}
    </div>
  );
};

export default Admin;
