import { FASTElement, Observable, observable, Subscriber } from "@microsoft/fast-element";
import { reverse } from "lodash-es";
import { DI, InterfaceSymbol, Registration } from "../di";
import { DerivedDesignTokenValue, DesignToken } from "./design-token";

/**
 * Where a DesignTokeNode can be targeted
 */
type NodeTarget = HTMLElement & FASTElement;

const nodeCache = new WeakMap<NodeTarget, Map<DesignToken<any>, DesignTokenNode<any>>>();
const channelCache = new Map<DesignToken<any>, InterfaceSymbol<DesignTokenNode<any>>>();
const childToParent = new Map<DesignTokenNode<any>, DesignTokenNode<any>>();
const noop = () => {};

export class DesignTokenNode<T> {
    private children: Set<DesignTokenNode<any>> = new Set();

    public parentNode: DesignTokenNode<T> | null = null;

    constructor(
        public readonly token: DesignToken<T>,
        public readonly target: NodeTarget
    ) {
        if (nodeCache.has(target) && nodeCache.get(target)!.has(token)) {
            throw new Error(
                `DesignTokenNode already created for ${token} and ${target}. Use DesignTokenNode.for() to ensure proper reuse`
            );
        }

        const container = DI.getOrCreateDOMContainer(this.target);
        const channel = DesignTokenNode.channel(token);
        container.register(Registration.instance(channel, this));
        const parent = this.findParentNode();

        if (parent) {
            parent.appendChild(this);
        }
    }

    private _value: T | undefined;

    public get value(): T {
        if (this._value !== void 0) {
            return this._value;
        } else if (childToParent.has(this)) {
            return childToParent.get(this)!.value;
        }

        throw new Error("Value could not be retrieved. Ensure the value is set");
    }

    public static for<T>(token: DesignToken<T>, target: NodeTarget) {
        const targetCache = nodeCache.has(target)
            ? nodeCache.get(target)!
            : nodeCache.set(target, new Map()) && nodeCache.get(target)!;
        return targetCache.has(token)
            ? targetCache.get(token)!
            : targetCache.set(token, new DesignTokenNode(token, target)) &&
                  targetCache.get(token)!;
    }

    private static channel<T>(
        token: DesignToken<T>
    ): InterfaceSymbol<DesignTokenNode<T>> {
        return channelCache.has(token)
            ? channelCache.get(token)!
            : channelCache.set(token, DI.createInterface<DesignTokenNode<T>>()) &&
                  channelCache.get(token)!;
    }

    /**
     * Invoked when parent node's value changes
     */
    public handleChange = this.valueChangeHandler;

    public valueChangeHandler(source: DesignTokenNode<T>, key: "value") {
        if (this._value === void 0) {
            Observable.getNotifier(this).notify("value");
        }
    }

    public appendChild<T>(child: DesignTokenNode<T>) {
        this.children.forEach(c => {
            if (child.contains(c)) {
                // Re-parent child
                this.removeChild(c);
                child.appendChild(c);
            }
        });

        this.children.add(child);
        Observable.getNotifier(this).subscribe(child, "value");
        childToParent.set(child, this);
    }

    public removeChild<T>(child: DesignTokenNode<T>) {
        this.children.delete(child);
        Observable.getNotifier(this).unsubscribe(child, "value");
        childToParent.delete(child);
    }

    public contains<T>(node: DesignTokenNode<T>) {
        return this.target.contains(node.target);
    }

    private findParentNode() {
        if (this.target.parentNode) {
            const container = DI.getOrCreateDOMContainer(this.target.parentElement!);
            try {
                return container.get(DesignTokenNode.channel(this.token));
            } catch (e) {
                return null;
            }
        } else {
            return null;
        }
    }

    public set(value: T | DerivedDesignTokenValue<T>) {
        if (typeof value === "function") {
            console.log(value);
        } else if (this._value !== value) {
            this._value = value;
            this.handleChange = noop;
            Observable.getNotifier(this).notify("value");
        }
    }

    public delete() {
        const prev = this.value;
        this._value = void 0;
        const next = this.value;
        this.handleChange = this.valueChangeHandler;

        if (prev !== next) {
            Observable.getNotifier(this).notify("value");
        }
    }
}
