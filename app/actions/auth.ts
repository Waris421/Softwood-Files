import { redirect } from "next/navigation";

const DEFAULT_REDIRECT_PATH = '/';

export async function authenticate(prevState: {message: string|null}, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const nextPath = formData.get('next') as string | null;

    if (!username || !password) {
        return { message: 'Missing username or password.' };
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();

        if (!response.ok) {
            return { message: data.message || 'Login failed. Please try again.' };
        }
    } catch (error) {
        console.error('Server Action login error:', error);
        return { message: 'An unexpected error occurred.' };
    }

    let redirectPath = DEFAULT_REDIRECT_PATH;
    if (nextPath) {
        //Basic security check to stop any hacking attempts
        if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
            redirectPath = nextPath;
        } else {
            console.warn('Attempted redirect to an invalid path:', nextPath);
        }
    }
    
    redirect(redirectPath);
}