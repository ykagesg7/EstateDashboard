import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const AcceptInvitation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInvitation = async () => {
      if (!id) return;

      try {
        const { data: invitation, error: invitationError } = await supabase
          .from("property_invitations")
          .select("*")
          .eq("id", id)
          .single();

        if (invitationError) throw invitationError;
        if (!invitation) throw new Error("招待が見つかりません");
        if (invitation.status !== "pending") throw new Error("この招待は既に処理されています");
      } catch (error) {
        setError(error.message);
      }
    };

    checkInvitation();
  }, [id]);

  const handleAcceptInvitation = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc("accept_property_invitation", {
        invitation_id: id,
      });

      if (error) throw error;

      toast({
        title: "招待を承認しました",
        description: "物件の共有が完了しました",
      });

      navigate("/properties");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "エラーが発生しました",
        description: "招待の承認に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>エラー</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>物件共有の招待</CardTitle>
        <CardDescription>
          この物件の共有招待を承認しますか？
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleAcceptInvitation}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "処理中..." : "招待を承認する"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AcceptInvitation;