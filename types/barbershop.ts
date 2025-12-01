export type Barber = {
    id: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    is_active: boolean;
};

export type Service = {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
    deposit_min: number;
    is_active: boolean;
};

export type AvailableSlot = string;
