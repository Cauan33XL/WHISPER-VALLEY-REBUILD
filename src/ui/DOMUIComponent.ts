import Phaser from 'phaser';
import { gsap } from 'gsap';

export default abstract class DOMUIComponent {
    protected scene: Phaser.Scene;
    protected uiScene: Phaser.Scene | null;
    protected container!: HTMLDivElement;
    protected isVisible: boolean = false;
    protected id: string;

    constructor(scene: Phaser.Scene, uiScene: Phaser.Scene | null, id: string) {
        this.scene = scene;
        this.uiScene = uiScene;
        this.id = id;

        this.createContainer();
    }

    private createContainer(): void {
        const existing = document.getElementById(this.id);
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        this.container = document.createElement('div');
        this.container.id = this.id;
        this.container.className = 'absolute inset-0 z-50 pointer-events-none hidden';

        const gameContainer = document.getElementById('app');
        if (gameContainer) {
            gameContainer.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }
    }

    public show(): void {
        if (this.isVisible) return;
        this.isVisible = true;
        this.container.classList.remove('hidden');

        gsap.killTweensOf(this.container);
        gsap.fromTo(this.container,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
    }

    public hide(onComplete?: () => void): void {
        if (!this.isVisible) {
            if (onComplete) onComplete();
            return;
        }

        this.isVisible = false;
        gsap.to(this.container, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                if (!this.isVisible) {
                    this.container.classList.add('hidden');
                }
                if (onComplete) onComplete();
            }
        });
    }

    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public isVisibleCheck(): boolean {
        return this.isVisible;
    }

    public destroy(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    protected setContent(html: string): void {
        this.container.innerHTML = html;
    }
}
