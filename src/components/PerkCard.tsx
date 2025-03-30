
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PerkCardProps {
  title: string;
  description: string;
  onClaim?: () => void;
  isClaimed?: boolean;
}

const PerkCard: React.FC<PerkCardProps> = ({ 
  title, 
  description, 
  onClaim,
  isClaimed = false
}) => {
  return (
    <Card className="border-buti-sand bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {title}
          <span className="text-buti-blue">🎁</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
      </CardContent>
      {onClaim && (
        <CardFooter>
          <Button 
            onClick={onClaim} 
            disabled={isClaimed}
            variant="outline" 
            className="w-full text-sm"
          >
            {isClaimed ? "Claimed ✓" : "Claim Perk"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PerkCard;
