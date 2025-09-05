import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Utensils, Leaf, ChefHat, Star, CheckCircle } from 'lucide-react';

interface MonthlyPlansProps {
  onSubscribe: (plan: any) => void;
}

const monthlyPlans = [
  {
    id: 'basic-veg',
    name: 'Basic Vegetarian',
    description: 'Daily meals with rice/chapathi and vegetarian curry',
    price: 1800,
    duration: '30 days',
    meals: 'Lunch & Dinner',
    includes: ['Rice or Chapathi', 'Vegetarian Curry', 'Dal', 'Pickle', 'Salad'],
    isVeg: true,
    isPopular: false
  },
  {
    id: 'premium-veg',
    name: 'Premium Vegetarian',
    description: 'Enhanced vegetarian meals with variety and desserts',
    price: 2400,
    duration: '30 days',
    meals: 'Breakfast, Lunch & Dinner',
    includes: ['Rice or Chapathi', 'Premium Veg Curry', 'Dal', 'Vegetable', 'Raita', 'Sweet/Dessert'],
    isVeg: true,
    isPopular: true
  },
  {
    id: 'basic-nonveg',
    name: 'Basic Non-Vegetarian',
    description: 'Daily meals with rice/chapathi and non-vegetarian curry',
    price: 2200,
    duration: '30 days',
    meals: 'Lunch & Dinner',
    includes: ['Rice or Chapathi', 'Chicken/Fish Curry', 'Dal', 'Pickle', 'Salad'],
    isVeg: false,
    isPopular: false
  },
  {
    id: 'premium-nonveg',
    name: 'Premium Non-Vegetarian',
    description: 'Complete non-vegetarian meals with variety and premium items',
    price: 2800,
    duration: '30 days',
    meals: 'Breakfast, Lunch & Dinner',
    includes: ['Rice or Chapathi', 'Premium Non-Veg Curry', 'Dal', 'Vegetable', 'Raita', 'Sweet/Dessert'],
    isVeg: false,
    isPopular: true
  }
];

export function MonthlyPlans({ onSubscribe }: MonthlyPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    mainCarb: 'rice', // rice or chapathi
    mealTimes: ['lunch', 'dinner'],
    startDate: new Date().toISOString().split('T')[0]
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setIsConfirmOpen(true);
  };

  const handleSubscribe = () => {
    if (selectedPlan) {
      const subscription = {
        ...selectedPlan,
        preferences,
        subscribedAt: new Date().toISOString(),
        qrCode: `MONTHLY-${selectedPlan.id.toUpperCase()}-${Date.now()}`
      };
      onSubscribe(subscription);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold">Monthly Subscription Plans</h3>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Save money and enjoy hassle-free dining with our monthly subscription plans. 
          Choose your preferred meals and we'll take care of the rest.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monthlyPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className={`h-full relative overflow-hidden ${
              plan.isPopular ? 'border-primary shadow-lg' : 'border-border'
            }`}>
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  <Star className="h-3 w-3 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {plan.isVeg ? (
                      <Leaf className="h-5 w-5 text-green-500" />
                    ) : (
                      <ChefHat className="h-5 w-5 text-orange-500" />
                    )}
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <Badge variant={plan.isVeg ? 'secondary' : 'outline'}>
                    {plan.isVeg ? 'Veg' : 'Non-Veg'}
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">₹{plan.price}</div>
                  <div className="text-sm text-muted-foreground">for {plan.duration}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    (~₹{Math.round(plan.price / 30)} per day)
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{plan.meals}</span>
                  </div>
                  <ul className="space-y-1">
                    {plan.includes.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full"
                  variant={plan.isPopular ? 'default' : 'outline'}
                >
                  Subscribe Now
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Subscription Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              Review your monthly plan details and preferences
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">{selectedPlan.name}</h4>
                <div className="text-2xl font-bold text-primary">₹{selectedPlan.price}</div>
                <div className="text-sm text-muted-foreground">for {selectedPlan.duration}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Preferred Main Carb</Label>
                  <RadioGroup
                    value={preferences.mainCarb}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, mainCarb: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rice" id="rice" />
                      <Label htmlFor="rice" className="text-sm">Rice (Default)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="chapathi" id="chapathi" />
                      <Label htmlFor="chapathi" className="text-sm">Chapathi/Roti</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed" className="text-sm">Mixed (Alternate)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                  <input
                    id="startDate"
                    type="date"
                    value={preferences.startDate}
                    onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Subscription auto-renews unless cancelled</p>
                <p>• You can modify preferences anytime</p>
                <p>• Monthly QR code will be generated for meal verification</p>
                <p>• Cancel anytime with 3 days notice</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubscribe} className="flex-1">
                  Confirm Subscription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}