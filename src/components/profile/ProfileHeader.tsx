
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, User as UserIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ProfileHeaderProps = {
  username: string;
  email?: string;
  avatarUrl?: string | null;
  onAvatarChange?: (file: File, url: string) => void;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  email,
  avatarUrl,
  onAvatarChange,
}) => {
  const [preview, setPreview] = useState<string | undefined>(avatarUrl || "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onAvatarChange?.(file, url);
      toast({
        title: "Success",
        description: "Profile picture updated!",
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-5">
      <div className="relative mb-2">
        <Avatar className="h-24 w-24 border-4 border-primary/30 bg-secondary/80 shadow-xl">
          {preview ? (
            <AvatarImage src={preview} alt="User avatar" />
          ) : (
            <AvatarFallback>
              <UserIcon className="h-12 w-12 text-primary/60" />
            </AvatarFallback>
          )}
        </Avatar>
        <button
          className="absolute bottom-2 right-2 bg-primary rounded-full p-2 shadow border border-white/10 hover:bg-accent transition"
          aria-label="Change avatar"
          onClick={handleChooseFile}
        >
          <Pencil className="h-4 w-4 text-white" />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{username}</span>
        {email && (
          <span className="text-sm text-muted-foreground mt-0.5">{email}</span>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
