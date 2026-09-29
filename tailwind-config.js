// Shared Tailwind CDN theme. Kept in an external file so the Content-Security-Policy
// in vercel.json can forbid inline scripts.
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                heading: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Calibri', 'sans-serif'],
            },
            colors: {
                primaryWhite: '#FFFFFF',
                offWhite: '#F9FAFB',
                deepCharcoal: '#111827',
                caritasCrimson: '#991B1B',
            }
        }
    }
};
