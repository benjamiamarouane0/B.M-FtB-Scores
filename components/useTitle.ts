import { useEffect } from 'react';

const useTitle = (title?: string, description?: string) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
        
        const updateMeta = (id: string, content: string) => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('content', content);
        };
        
        if (description) {
            updateMeta('meta-description', description);
            updateMeta('og-description', description);
            updateMeta('twitter-description', description);
        }
        
        if (title) {
            updateMeta('og-title', title);
            updateMeta('twitter-title', title);
        }
        
    }, [title, description]);
};

export default useTitle;
