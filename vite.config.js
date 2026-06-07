import { defineConfig } from 'vite';
import buildPresentation from './build.js';

export default defineConfig({
    plugins: [
        {
            name: 'build-presentation-watcher',
            // Build slides on startup
            buildStart() {
                buildPresentation();
            },
            // Watch pages/ directory and template.html for updates
            handleHotUpdate({ file, server }) {
                // Normalize file paths to avoid slash mismatches
                const normalizedPath = file.replace(/\\/g, '/');
                if (normalizedPath.includes('/pages/') || normalizedPath.endsWith('/template.html')) {
                    console.log(`\n[Vite Plugin] Slide file modified: ${pathName(normalizedPath)}`);
                    try {
                        buildPresentation();
                        // Trigger full page refresh in client
                        server.ws.send({
                            type: 'full-reload',
                            path: '*'
                        });
                    } catch (err) {
                        console.error('[Vite Plugin] Compilation failed:', err);
                    }
                }
            }
        }
    ],
    server: {
        watch: {
            // Ensure template.html and pages directory are watched
            usePolling: true
        }
    }
});

function pathName(p) {
    const parts = p.split('/');
    return parts.slice(-2).join('/');
}
