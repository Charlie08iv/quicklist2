
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Users, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // Direct logged-in users to lists page
  React.useEffect(() => {
    if (session) {
      navigate('/lists');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/70">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-primary">QuickList</h1>
            <p className="text-lg text-muted-foreground">
              Simplify meal planning and grocery shopping
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 my-10">
            <FeatureCard 
              icon={<Calendar className="h-8 w-8" />}
              title="Shopping Lists"
              description="Create and manage your shopping lists easily"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Recipes"
              description="Find and save your favorite recipes"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Groups"
              description="Share lists with family and friends"
            />
            <FeatureCard
              icon={<UserCircle className="h-8 w-8" />}
              title="Personalized"
              description="Your data, your way"
            />
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full py-6 text-lg" 
              onClick={() => navigate('/auth')}
            >
              Sign In / Sign Up
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-6 text-lg"
              onClick={() => navigate('/lists')}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>© 2025 QuickList - Grocery Planning Made Simple</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-card/70 backdrop-blur-sm p-4 rounded-xl border border-border/50 flex flex-col items-center text-center">
      <div className="mb-3 text-primary">{icon}</div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
