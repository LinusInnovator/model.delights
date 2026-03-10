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
            {!userId ? (
                <SignInButton mode="modal">
                    <button style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        Developer Login
                    </button>
                </SignInButton>
            ) : (
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
