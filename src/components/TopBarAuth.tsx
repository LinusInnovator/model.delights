"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function TopBarAuth() {
    const { isLoaded, userId } = useAuth();

    if (!isLoaded) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '40px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        }}>
            {!userId ? null : (
                <UserButton
                    appearance={{
                        elements: {
                            userButtonAvatarBox: {
                                width: '36px',
                                height: '36px',
                                border: '2px solid rgba(0, 229, 255, 0.3)'
                            }
                        }
                    }}
                />
            )}
        </div>
    );
}
