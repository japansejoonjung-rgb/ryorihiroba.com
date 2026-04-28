"use client";

import { useCallback, useEffect, useState } from "react";
import { UserProfile, getUserProfile } from "@/lib/userService";

export function useUserProfile(uid?: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(uid));

  const loadProfile = useCallback(async (targetUid?: string | null) => {
    if (!targetUid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    return getUserProfile(targetUid)
      .then((item) => {
        setProfile(item);
        return item;
      })
      .catch(() => {
        setProfile(null);
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

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

  return { profile, loading, refresh: () => loadProfile(uid) };
}
