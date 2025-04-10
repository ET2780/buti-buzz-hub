import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { BiUserCircle } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateUsername } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AdminLoginModal } from "@/components/modals/AdminLoginModal";

export default function WelcomePage() {
  const { createTemporaryUser } = useAuth();
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleQuickAccess = async () => {
    try {
      const userId = await createTemporaryUser();
      toast.success('ברוך הבא! התחברת בהצלחה');
      navigate('/chat');
    } catch (error) {
      console.error('Error creating temporary user:', error);
      toast.error('אירעה שגיאה בהתחברות. אנא נסה שוב');
    }
  };

  const handleAdminLoginSuccess = () => {
    navigate('/chat');
  };

  const handleMembershipClick = () => {
    toast.info("מועדון החברים יושק בקרוב! 🚀");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/buti-cafe-wall.jpg")',
          transform: 'scale(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content Card */}
      <Card className="relative w-full max-w-2xl bg-white/95 p-8 md:p-12 shadow-2xl backdrop-blur-sm border-0 animate-fadeIn">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-white/80 blur-xl rounded-full transform scale-150" />
            <img 
              src="/buti-logo.png" 
              alt="BUTI Logo" 
              className="h-24 md:h-28 relative object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-6 text-right relative" dir="rtl">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            ברוכים הבאים למועדון הקהילה של BUTI
          </h1>
          
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            התחברו כדי להצטרף לשיחה בזמן אמת עם אנשים שנמצאים ממש כאן איתכם. בין אם אתם מחפשים שקע, רוצים להצטרף לשולחן, לשבת ליד חלון, או למצוא פרטנר לדיל צהריים – המקום הזה בשבילכם.
          </p>
          
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            שתפו שירים לפלייליסט של BUTI, קבלו מבצעים בלעדיים, וגלו אנשים עם תחומי עניין משותפים.
          </p>
        </div>

        {/* Login Options */}
        <div className="mt-10 space-y-4" dir="rtl">
          {/* Quick Access Button */}
          <Button 
            variant="default" 
            className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-12 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleQuickAccess}
          >
            <BiUserCircle className="h-6 w-6" />
            כניסה מהירה כאורח
          </Button>

          {/* Membership Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white/95">בקרוב - מועדון החברים</span>
            </div>
          </div>

          {/* Members Club Button (Coming Soon) */}
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-3 text-lg h-12 border-2 border-primary text-primary hover:bg-primary/10 shadow-sm transition-all duration-200 opacity-75"
            onClick={handleMembershipClick}
            disabled
          >
            <FaGoogle className="h-5 w-5" />
            מועדון החברים - בקרוב!
          </Button>
        </div>

        {/* Admin Login Link */}
        <div className="mt-8 text-center" dir="rtl">
          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-gray-600 hover:text-gray-800 text-sm inline-flex items-center gap-1 transition-colors duration-200 hover:underline"
          >
            כניסת מנהל →
          </button>
        </div>

        {/* Community Board Link */}
        <div className="mt-8 text-center" dir="rtl">
          <Link 
            to="/board" 
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1 transition-colors duration-200 hover:underline"
          >
            הצטרפו ללוח המודעות של BUTI →
          </Link>
        </div>
      </Card>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
} 