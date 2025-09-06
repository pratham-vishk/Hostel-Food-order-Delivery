import { useState } from 'react';
import { motion } from 'motion/react';
import { FoodItem, CartItem } from '../App';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, Clock, Star, Flame, Leaf, ChefHat, Minus } from 'lucide-react';

interface FoodMenuProps {
  onAddToCart: (item: FoodItem) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const menuItems: FoodItem[] = [
  // Breakfast
  {
    id: '1',
    name: 'Aloo Paratha with Curd',
    description: 'Stuffed potato flatbread served with fresh yogurt and pickle',
    price: 45,
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1683533678033-f5d60f0a3437?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBmb29kJTIwaW5kaWFufGVufDF8fHx8MTc1Njc5NDU2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.5,
    isPopular: true,
    isVeg: true
  },
  {
    id: '2',
    name: 'Poha',
    description: 'Flattened rice with onions, potatoes, and spices',
    price: 30,
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1683533678033-f5d60f0a3437?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBmb29kJTIwaW5kaWFufGVufDF8fHx8MTc1Njc5NDU2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.2,
    isVeg: true
  },
  {
    id: '3',
    name: 'Upma',
    description: 'Semolina porridge with vegetables and South Indian spices',
    price: 25,
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1683533678033-f5d60f0a3437?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBmb29kJTIwaW5kaWFufGVufDF8fHx8MTc1Njc5NDU2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.0,
    isVeg: true
  },
  
  // Lunch
  {
    id: '4',
    name: 'Dal Thali',
    description: 'Complete meal with dal, rice, vegetables, roti, and pickle',
    price: 80,
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1742281258189-3b933879867a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsdW5jaCUyMHRoYWxpfGVufDF8fHx8MTc1Njc5NDU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.6,
    isPopular: true,
    isVeg: true
  },
  {
    id: '5',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with spiced chicken and boiled egg',
    price: 120,
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBiaXJ5YW5pfGVufDF8fHx8MTc1Njc5NDU3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.8,
    isPopular: true,
    isSpicy: true
  },
  {
    id: '6',
    name: 'Rajma Rice',
    description: 'Red kidney beans curry served with steamed rice',
    price: 70,
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1627482265910-5c0ff6bee088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkYWwlMjByaWNlfGVufDF8fHx8MTc1Njc5NDU3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.3,
    isVeg: true
  },

  // Dinner
  {
    id: '7',
    name: 'Chole Bhature',
    description: 'Spicy chickpea curry with deep-fried bread',
    price: 85,
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1666251214795-a1296307d29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkaW5uZXIlMjByaWNlJTIwY3Vycnl8ZW58MXx8fHwxNzU2Nzk0NTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.4,
    isVeg: true,
    isSpicy: true
  },
  {
    id: '8',
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese in rich tomato-based gravy with rice or roti',
    price: 95,
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1666251214795-a1296307d29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkaW5uZXIlMjByaWNlJTIwY3Vycnl8ZW58MXx8fHwxNzU2Nzk0NTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.7,
    isPopular: true,
    isVeg: true
  },
  {
    id: '9',
    name: 'Fish Curry Rice',
    description: 'Bengali-style fish curry with steamed basmati rice',
    price: 110,
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1666251214795-a1296307d29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkaW5uZXIlMjByaWNlJTIwY3Vycnl8ZW58MXx8fHwxNzU2Nzk0NTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: false,
    rating: 4.5,
    isSpicy: true
  },

  // Snacks
  {
    id: '10',
    name: 'Samosa (2 pcs)',
    description: 'Crispy triangular pastries filled with spiced potatoes',
    price: 20,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzbmFja3MlMjBzYW1vc2F8ZW58MXx8fHwxNzU2Nzk0NTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.1,
    isVeg: true
  },
  {
    id: '11',
    name: 'Pav Bhaji',
    description: 'Spiced vegetable mash served with buttered bread rolls',
    price: 50,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzbmFja3MlMjBzYW1vc2F8ZW58MXx8fHwxNzU2Nzk0NTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 4.3,
    isVeg: true,
    isSpicy: true
  },
  {
    id: '12',
    name: 'Maggi Noodles',
    description: '2-minute instant noodles with vegetables and spices',
    price: 35,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzbmFja3MlMjBzYW1vc2F8ZW58MXx8fHwxNzU2Nzk0NTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    rating: 3.9,
    isVeg: true
  }
];



export function FoodMenu({ onAddToCart, cartItems, onUpdateQuantity, selectedCategory }: {
  onAddToCart: (item: FoodItem) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  selectedCategory: string;
}) {
  const getItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category);
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncrement = (item: FoodItem) => {
    const currentQuantity = getItemQuantity(item.id);
    if (currentQuantity === 0) {
      onAddToCart(item);
    } else {
      onUpdateQuantity(item.id, currentQuantity + 1);
    }
  };

  const handleDecrement = (itemId: string) => {
    const currentQuantity = getItemQuantity(itemId);
    if (currentQuantity > 0) {
      onUpdateQuantity(itemId, currentQuantity - 1);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <ChefHat className="h-8 w-8 text-primary" />
          <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Today's Fresh Menu
          </h3>
          <ChefHat className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground">Crafted with passion, served with excellence</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {getItemsByCategory(selectedCategory).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="group overflow-hidden h-full modern-shadow hover:scale-[1.02] transition-all duration-500 bg-card/80 backdrop-blur-sm border-0">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.isPopular && (
                          <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 shadow-lg font-bold px-3 py-1">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Bestseller
                            </Badge>
                          </motion.div>
                        )}
                        {item.isVeg && (
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-md font-semibold">
                            <Leaf className="h-3 w-3 mr-1" />
                            Pure Veg
                          </Badge>
                        )}
                        {item.isSpicy && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-md font-semibold">
                            <Flame className="h-3 w-3 mr-1" />
                            Spicy Hot
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-2xl font-bold text-xl shadow-xl border-2 border-white/20">
                          ₹{item.price}
                        </div>
                      </div>
                      
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                          <Badge className="bg-red-500 text-white border-0 shadow-2xl px-6 py-3 text-lg font-bold">
                            <Clock className="h-5 w-5 mr-2" />
                            Sold Out
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold leading-tight text-foreground">{item.name}</CardTitle>
                        {item.rating && (
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{item.rating}</span>
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardFooter className="pt-0 flex flex-col gap-4">
                      {getItemQuantity(item.id) === 0 ? (
                        <motion.div 
                          className="w-full"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleIncrement(item)}
                            disabled={!item.available}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl py-4 font-bold text-lg"
                          >
                            <Plus className="h-5 w-5" />
                            Add to Cart
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="w-full"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl p-2 border border-orange-200 dark:border-orange-800">
                            <Button
                              onClick={() => handleDecrement(item.id)}
                              variant="ghost"
                              size="sm"
                              className="h-12 w-12 rounded-xl bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/50 shadow-md"
                            >
                              <Minus className="h-5 w-5 text-orange-600" />
                            </Button>
                            
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {getItemQuantity(item.id)}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                in cart
                              </span>
                            </div>
                            
                            <Button
                              onClick={() => handleIncrement(item)}
                              variant="ghost"
                              size="sm"
                              className="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                          
                          <motion.div 
                            className="text-center mt-2"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              ₹{(item.price * getItemQuantity(item.id)).toFixed(0)} total
                            </span>
                          </motion.div>
                        </motion.div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
      </motion.div>
    </div>
  );
}