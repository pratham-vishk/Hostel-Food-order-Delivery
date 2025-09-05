import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Building2, User as UserIcon, Lock, Mail, Phone, MapPin, Shield, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';
import type { User as UserType } from '../services/authService';

interface LoginProps {
  onLogin: (data: { user: UserType; token: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loginForm, setLoginForm] = useState({ 
    username: '', 
    password: '',
    role: 'customer' as 'admin' | 'agent' | 'customer'
  });
  const [signupForm, setSignupForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    roomNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [signupResult, setSignupResult] = useState<{ message: string; requiresApproval: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await AuthService.login({
        username: loginForm.username,
        password: loginForm.password,
        role: loginForm.role
      });
      
      onLogin(result);
    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSignupResult(null);
    
    try {
      const result = await AuthService.signup(signupForm);
      setSignupResult(result);
    } catch (error: any) {
      setErrorMessage(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary rounded-full blur-3xl"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SR Guest House</h1>
              <p className="text-sm text-muted-foreground">Premium Food Service</p>
            </div>
          </div>
        </motion.div>

        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Login As
                    </Label>
                    <Select value={loginForm.role} onValueChange={(value) => setLoginForm(prev => ({ ...prev, role: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="agent">Delivery Agent</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  {errorMessage && (
                    <Alert className="border-red-500">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                  
                  <div className="space-y-2 text-xs text-center text-muted-foreground border-t pt-4">
                    <p className="font-medium">Demo Credentials:</p>
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Admin: admin / admin</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Truck className="h-3 w-3" />
                      <span>Agent: agent001 / agent123</span>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {signupResult ? (
                  <Alert className="border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      {signupResult.message}
                      {signupResult.requiresApproval && (
                        <div className="mt-2 text-sm">
                          <p>You'll receive a notification once your account is approved by an administrator.</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupUsername" className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Username
                        </Label>
                        <Input
                          id="signupUsername"
                          type="text"
                          placeholder="username"
                          value={signupForm.username}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roomNumber" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Room
                        </Label>
                        <Input
                          id="roomNumber"
                          type="text"
                          placeholder="A-101"
                          value={signupForm.roomNumber}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>

                    {errorMessage && (
                      <Alert className="border-red-500">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Customer registrations require admin approval
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}