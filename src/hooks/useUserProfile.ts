"use client";

import { useEffect, useState } from "react";
import { UserProfile, getUserProfile } from "@/lib/userService";

export function useUserProfile(uid?: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    getUserProfile(uid)
      .then((item) => {
        if (mounted) setProfile(item);
      })
      .catch(() => {
        if (mounted) setProfile(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [uid]);

  return { profile, loading };
}
