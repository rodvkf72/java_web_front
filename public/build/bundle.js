
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function init_claim_info(nodes) {
        if (nodes.claim_info === undefined) {
            nodes.claim_info = { last_index: 0, total_claimed: 0 };
        }
    }
    function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
        // Try to find nodes in an order such that we lengthen the longest increasing subsequence
        init_claim_info(nodes);
        const resultNode = (() => {
            // We first try to find an element after the previous one
            for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
                const node = nodes[i];
                if (predicate(node)) {
                    const replacement = processNode(node);
                    if (replacement === undefined) {
                        nodes.splice(i, 1);
                    }
                    else {
                        nodes[i] = replacement;
                    }
                    if (!dontUpdateLastIndex) {
                        nodes.claim_info.last_index = i;
                    }
                    return node;
                }
            }
            // Otherwise, we try to find one before
            // We iterate in reverse so that we don't go too far back
            for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
                const node = nodes[i];
                if (predicate(node)) {
                    const replacement = processNode(node);
                    if (replacement === undefined) {
                        nodes.splice(i, 1);
                    }
                    else {
                        nodes[i] = replacement;
                    }
                    if (!dontUpdateLastIndex) {
                        nodes.claim_info.last_index = i;
                    }
                    else if (replacement === undefined) {
                        // Since we spliced before the last_index, we decrease it
                        nodes.claim_info.last_index--;
                    }
                    return node;
                }
            }
            // If we can't find any matching node, we create a new one
            return createNode();
        })();
        resultNode.claim_order = nodes.claim_info.total_claimed;
        nodes.claim_info.total_claimed += 1;
        return resultNode;
    }
    function claim_element_base(nodes, name, attributes, create_element) {
        return claim_node(nodes, (node) => node.nodeName === name, (node) => {
            const remove = [];
            for (let j = 0; j < node.attributes.length; j++) {
                const attribute = node.attributes[j];
                if (!attributes[attribute.name]) {
                    remove.push(attribute.name);
                }
            }
            remove.forEach(v => node.removeAttribute(v));
            return undefined;
        }, () => create_element(name));
    }
    function claim_element(nodes, name, attributes) {
        return claim_element_base(nodes, name, attributes, element);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    function hasContext(key) {
        return get_current_component().$$.context.has(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function p(e,a=!1){return e=e.slice(e.startsWith("/#")?2:0,e.endsWith("/*")?-2:void 0),e.startsWith("/")||(e="/"+e),e==="/"&&(e=""),a&&!e.endsWith("/")&&(e+="/"),e}function d(e,a){e=p(e,!0),a=p(a,!0);let r=[],n={},t=!0,s=e.split("/").map(o=>o.startsWith(":")?(r.push(o.slice(1)),"([^\\/]+)"):o).join("\\/"),c=a.match(new RegExp(`^${s}$`));return c||(t=!1,c=a.match(new RegExp(`^${s}`))),c?(r.forEach((o,h)=>n[o]=c[h+1]),{exact:t,params:n,part:c[0].slice(0,-1)}):null}function x(e,a,r){if(r==="")return e;if(r[0]==="/")return r;let n=c=>c.split("/").filter(o=>o!==""),t=n(e),s=a?n(a):[];return "/"+s.map((c,o)=>t[o]).join("/")+"/"+r}function m(e,a,r,n){let t=[a,"data-"+a].reduce((s,c)=>{let o=e.getAttribute(c);return r&&e.removeAttribute(c),o===null?s:o},!1);return !n&&t===""?!0:t||n||!1}function S(e){let a=e.split("&").map(r=>r.split("=")).reduce((r,n)=>{let t=n[0];if(!t)return r;let s=n.length>1?n[n.length-1]:!0;return typeof s=="string"&&s.includes(",")&&(s=s.split(",")),r[t]===void 0?r[t]=[s]:r[t].push(s),r},{});return Object.entries(a).reduce((r,n)=>(r[n[0]]=n[1].length>1?n[1]:n[1][0],r),{})}function M(e){return Object.entries(e).map(([a,r])=>r?r===!0?a:`${a}=${Array.isArray(r)?r.join(","):r}`:null).filter(a=>a).join("&")}function w(e,a){return e?a+e:""}function k(e){throw new Error("[Tinro] "+e)}var i={HISTORY:1,HASH:2,MEMORY:3,OFF:4,run(e,a,r,n){return e===this.HISTORY?a&&a():e===this.HASH?r&&r():n&&n()},getDefault(){return !window||window.location.pathname==="srcdoc"?this.MEMORY:this.HISTORY}};var y,$,H,b$1="",l=E();function E(){let e=i.getDefault(),a,r=c=>window.onhashchange=window.onpopstate=y=null,n=c=>a&&a(R(e)),t=c=>{c&&(e=c),r(),e!==i.OFF&&i.run(e,o=>window.onpopstate=n,o=>window.onhashchange=n)&&n();},s=c=>{let o=Object.assign(R(e),c);return o.path+w(M(o.query),"?")+w(o.hash,"#")};return {mode:t,get:c=>R(e),go(c,o){_(e,c,o),n();},start(c){a=c,t();},stop(){a=null,t(i.OFF);},set(c){this.go(s(c),!c.path);},methods(){return j(this)},base:c=>b$1=c}}function _(e,a,r){!r&&($=H);let n=t=>history[`${r?"replace":"push"}State`]({},"",t);i.run(e,t=>n(b$1+a),t=>n(`#${a}`),t=>y=a);}function R(e){let a=window.location,r=i.run(e,t=>(b$1?a.pathname.replace(b$1,""):a.pathname)+a.search+a.hash,t=>String(a.hash.slice(1)||"/"),t=>y||"/"),n=r.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);return H=r,{url:r,from:$,path:n[1]||"",query:S(n[2]||""),hash:n[3]||""}}function j(e){let a=()=>e.get().query,r=c=>e.set({query:c}),n=c=>r(c(a())),t=()=>e.get().hash,s=c=>e.set({hash:c});return {hash:{get:t,set:s,clear:()=>s("")},query:{replace:r,clear:()=>r(""),get(c){return c?a()[c]:a()},set(c,o){n(h=>(h[c]=o,h));},delete(c){n(o=>(o[c]&&delete o[c],o));}}}}var f$1=T();function T(){let{subscribe:e}=writable(l.get(),a=>{l.start(a);let r=P(l.go);return ()=>{l.stop(),r();}});return {subscribe:e,goto:l.go,params:Q,meta:O,useHashNavigation:a=>l.mode(a?i.HASH:i.HISTORY),mode:{hash:()=>l.mode(i.HASH),history:()=>l.mode(i.HISTORY),memory:()=>l.mode(i.MEMORY)},base:l.base,location:l.methods()}}function P(e){let a=r=>{let n=r.target.closest("a[href]"),t=n&&m(n,"target",!1,"_self"),s=n&&m(n,"tinro-ignore"),c=r.ctrlKey||r.metaKey||r.altKey||r.shiftKey;if(t=="_self"&&!s&&!c&&n){let o=n.getAttribute("href").replace(/^\/#/,"");/^\/\/|^#|^[a-zA-Z]+:/.test(o)||(r.preventDefault(),e(o.startsWith("/")?o:n.href.replace(window.location.origin,"")));}};return addEventListener("click",a),()=>removeEventListener("click",a)}function Q(){return getContext("tinro").meta.params}var g="tinro",K=v({pattern:"",matched:!0});function q(e){let a=getContext(g)||K;(a.exact||a.fallback)&&k(`${e.fallback?"<Route fallback>":`<Route path="${e.path}">`}  can't be inside ${a.fallback?"<Route fallback>":`<Route path="${a.path||"/"}"> with exact path`}`);let r=e.fallback?"fallbacks":"childs",n=writable({}),t=v({fallback:e.fallback,parent:a,update(s){t.exact=!s.path.endsWith("/*"),t.pattern=p(`${t.parent.pattern||""}${s.path}`),t.redirect=s.redirect,t.firstmatch=s.firstmatch,t.breadcrumb=s.breadcrumb,t.match();},register:()=>(t.parent[r].add(t),async()=>{t.parent[r].delete(t),t.parent.activeChilds.delete(t),t.router.un&&t.router.un(),t.parent.match();}),show:()=>{e.onShow(),!t.fallback&&t.parent.activeChilds.add(t);},hide:()=>{e.onHide(),t.parent.activeChilds.delete(t);},match:async()=>{t.matched=!1;let{path:s,url:c,from:o,query:h}=t.router.location,u=d(t.pattern,s);if(!t.fallback&&u&&t.redirect&&(!t.exact||t.exact&&u.exact)){let A=x(s,t.parent.pattern,t.redirect);return f$1.goto(A,!0)}t.meta=u&&{from:o,url:c,query:h,match:u.part,pattern:t.pattern,breadcrumbs:t.parent.meta&&t.parent.meta.breadcrumbs.slice()||[],params:u.params,subscribe:n.subscribe},t.breadcrumb&&t.meta&&t.meta.breadcrumbs.push({name:t.breadcrumb,path:u.part}),n.set(t.meta),u&&!t.fallback&&(!t.exact||t.exact&&u.exact)&&(!t.parent.firstmatch||!t.parent.matched)?(e.onMeta(t.meta),t.parent.matched=!0,t.show()):t.hide(),u&&t.showFallbacks();}});return setContext(g,t),onMount(()=>t.register()),t}function O(){return hasContext(g)?getContext(g).meta:k("meta() function must be run inside any `<Route>` child component only")}function v(e){let a={router:{},exact:!1,pattern:null,meta:null,parent:null,fallback:!1,redirect:!1,firstmatch:!1,breadcrumb:null,matched:!1,childs:new Set,activeChilds:new Set,fallbacks:new Set,async showFallbacks(){if(!this.fallback&&(await tick(),this.childs.size>0&&this.activeChilds.size==0||this.childs.size==0&&this.fallbacks.size>0)){let r=this;for(;r.fallbacks.size==0;)if(r=r.parent,!r)return;r&&r.fallbacks.forEach(n=>{if(n.redirect){let t=x("/",n.parent.pattern,n.redirect);f$1.goto(t,!0);}else n.show();});}},start(){this.router.un||(this.router.un=f$1.subscribe(r=>{this.router.location=r,this.pattern!==null&&this.match();}));},match(){this.showFallbacks();}};return Object.assign(a,e),a.start(),a}

    /* node_modules\tinro\cmp\Route.svelte generated by Svelte v3.48.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*params*/ 2,
    	meta: dirty & /*meta*/ 4
    });

    const get_default_slot_context = ctx => ({
    	params: /*params*/ ctx[1],
    	meta: /*meta*/ ctx[2]
    });

    // (33:0) {#if showContent}
    function create_if_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, params, meta*/ 262)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(33:0) {#if showContent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showContent*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showContent*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showContent*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = '/*' } = $$props;
    	let { fallback = false } = $$props;
    	let { redirect = false } = $$props;
    	let { firstmatch = false } = $$props;
    	let { breadcrumb = null } = $$props;
    	let showContent = false;
    	let params = {}; /* DEPRECATED */
    	let meta = {};

    	const route = q({
    		fallback,
    		onShow() {
    			$$invalidate(0, showContent = true);
    		},
    		onHide() {
    			$$invalidate(0, showContent = false);
    		},
    		onMeta(newmeta) {
    			$$invalidate(2, meta = newmeta);
    			$$invalidate(1, params = meta.params); /* DEPRECATED */
    		}
    	});

    	const writable_props = ['path', 'fallback', 'redirect', 'firstmatch', 'breadcrumb'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    		if ('fallback' in $$props) $$invalidate(4, fallback = $$props.fallback);
    		if ('redirect' in $$props) $$invalidate(5, redirect = $$props.redirect);
    		if ('firstmatch' in $$props) $$invalidate(6, firstmatch = $$props.firstmatch);
    		if ('breadcrumb' in $$props) $$invalidate(7, breadcrumb = $$props.breadcrumb);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createRouteObject: q,
    		path,
    		fallback,
    		redirect,
    		firstmatch,
    		breadcrumb,
    		showContent,
    		params,
    		meta,
    		route
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    		if ('fallback' in $$props) $$invalidate(4, fallback = $$props.fallback);
    		if ('redirect' in $$props) $$invalidate(5, redirect = $$props.redirect);
    		if ('firstmatch' in $$props) $$invalidate(6, firstmatch = $$props.firstmatch);
    		if ('breadcrumb' in $$props) $$invalidate(7, breadcrumb = $$props.breadcrumb);
    		if ('showContent' in $$props) $$invalidate(0, showContent = $$props.showContent);
    		if ('params' in $$props) $$invalidate(1, params = $$props.params);
    		if ('meta' in $$props) $$invalidate(2, meta = $$props.meta);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, redirect, firstmatch, breadcrumb*/ 232) {
    			route.update({ path, redirect, firstmatch, breadcrumb });
    		}
    	};

    	return [
    		showContent,
    		params,
    		meta,
    		path,
    		fallback,
    		redirect,
    		firstmatch,
    		breadcrumb,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			path: 3,
    			fallback: 4,
    			redirect: 5,
    			firstmatch: 6,
    			breadcrumb: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redirect() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redirect(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstmatch() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstmatch(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get breadcrumb() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set breadcrumb(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function b(e){let t;return {c(){t=element("div");},l(e){t=claim_element(e,"DIV",{}),children(t).forEach(detach);},m(s,r){insert(s,t,r),e[5](t);},p:noop,i:noop,o:noop,d(s){s&&detach(t),e[5](null);}}}function h(e,t,s){let{repo:r}=t,{theme:i}=t;const u=void 0;let n,{issue:o=(()=>({issueTerm:t.issueTerm,issueNumber:t.issueNumber}))()}=t;return onMount((()=>{if(!n)return;const e=(({repo:e,label:t,theme:s,issueTerm:r,issueNumber:i})=>{const u=document.createElement("script");if(u.src="https://utteranc.es/client.js",u.async=!0,u.setAttribute("repo",e),r){const e=Array.isArray(r)?r.join(" "):r;u.setAttribute("issue-term",e);}else "number"==typeof i&&u.setAttribute("issue-number",String(i));return u.setAttribute("crossorigin","anonymous"),u.setAttribute("theme",s),t&&u.setAttribute("label",t),u})(Object.assign({repo:r,theme:i,label:u},o));var t,l;s(0,(l=e,(t=n).childNodes.forEach((e=>{e.remove();})),t.appendChild(l),n=t));})),e.$$set=e=>{s(6,t=assign(assign({},t),exclude_internal_props(e))),"repo"in e&&s(1,r=e.repo),"theme"in e&&s(2,i=e.theme),"issue"in e&&s(4,o=e.issue);},t=exclude_internal_props(t),[n,r,i,u,o,function(e){binding_callbacks[e?"unshift":"push"]((()=>{n=e,s(0,n);}));}]}class f extends SvelteComponent{constructor(e){super(),init(this,e,h,b,safe_not_equal,{repo:1,theme:2,label:3,issue:4});}get label(){return this.$$.ctx[3]}}

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return toString.call(val) === '[object FormData]';
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return toString.call(val) === '[object URLSearchParams]';
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    var defaults$1 = defaults_1;

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional = config.transitional || defaults$1.transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(
            timeoutErrorMessage,
            config,
            transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new Cancel_1('canceled') : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw enhanceError(e, this, 'E_JSON_PARSE');
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults$1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new Cancel_1('canceled');
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults$1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.25.0"
    };

    var VERSION = data.version;

    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError('option ' + opt + ' must be ' + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error('Unknown option ' + opt);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      if (!config.url) {
        throw new Error('Provided config url is not valid');
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      if (!config.url) {
        throw new Error('Provided config url is not valid');
      }
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults$1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;
    axios$1.VERSION = data.version;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    /* src\Java\index.svelte generated by Svelte v3.48.0 */

    const file$g = "src\\Java\\index.svelte";

    function create_fragment$g(ctx) {
    	let meta0;
    	let meta1;
    	let meta2;
    	let meta3;
    	let link0;
    	let link1;
    	let link2;
    	let link3;
    	let link4;
    	let link5;
    	let link6;
    	let link7;
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let t0;
    	let body;
    	let div0;
    	let t1;
    	let video;
    	let source;
    	let source_src_value;
    	let t2;
    	let div7;
    	let div1;
    	let t3;
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let h1;
    	let t5;
    	let p0;
    	let t6;
    	let strong0;
    	let t8;
    	let strong1;
    	let t10;
    	let t11;
    	let p1;
    	let strong2;
    	let t13;
    	let strong3;
    	let t15;
    	let t16;
    	let p2;
    	let t17;
    	let br;
    	let t18;
    	let t19;
    	let p3;
    	let t20;
    	let div2;
    	let form;
    	let input0;
    	let t21;
    	let input1;
    	let t22;
    	let input2;
    	let t23;
    	let div8;
    	let ul;
    	let li0;
    	let a0;
    	let i0;
    	let t24;
    	let li1;
    	let a1;
    	let i1;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			link3 = element("link");
    			link4 = element("link");
    			link5 = element("link");
    			link6 = element("link");
    			link7 = element("link");
    			script0 = element("script");
    			script1 = element("script");
    			t0 = space();
    			body = element("body");
    			div0 = element("div");
    			t1 = space();
    			video = element("video");
    			source = element("source");
    			t2 = space();
    			div7 = element("div");
    			div1 = element("div");
    			t3 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "준비 중 입니다!";
    			t5 = space();
    			p0 = element("p");
    			t6 = text("함수형 프로그래밍 언어인 ");
    			strong0 = element("strong");
    			strong0.textContent = "Golang";
    			t8 = text(" 으로 작성된 블로그를 ");
    			strong1 = element("strong");
    			strong1.textContent = "Java";
    			t10 = text(" 로 리빌딩 중 입니다.");
    			t11 = space();
    			p1 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Golang";
    			t13 = text(" Website Convert To ");
    			strong3 = element("strong");
    			strong3.textContent = "Java";
    			t15 = text(" Website");
    			t16 = space();
    			p2 = element("p");
    			t17 = text("Front-End : jsp, Bootstrap Template\r\n            \t");
    			br = element("br");
    			t18 = text("Back-End : Java, mybatis, MySQL, Spring Boot");
    			t19 = space();
    			p3 = element("p");
    			t20 = space();
    			div2 = element("div");
    			form = element("form");
    			input0 = element("input");
    			t21 = space();
    			input1 = element("input");
    			t22 = space();
    			input2 = element("input");
    			t23 = space();
    			div8 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			i0 = element("i");
    			t24 = space();
    			li1 = element("li");
    			a1 = element("a");
    			i1 = element("i");
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$g, 1, 2, 17);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, shrink-to-fit=no");
    			add_location(meta1, file$g, 2, 2, 43);
    			attr_dev(meta2, "name", "description");
    			attr_dev(meta2, "content", "");
    			add_location(meta2, file$g, 3, 2, 133);
    			attr_dev(meta3, "name", "author");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file$g, 4, 2, 173);
    			attr_dev(link0, "href", "/Java/vendor/blog/bootstrap/css/bootstrap.min.css");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$g, 7, 2, 241);
    			attr_dev(link1, "href", "/Java/vendor/blog/fontawesome-free/css/all.min.css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file$g, 10, 2, 370);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic");
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			add_location(link2, file$g, 11, 2, 471);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800");
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			add_location(link3, file$g, 12, 2, 594);
    			attr_dev(link4, "href", "/Java/css/blog/clean-blog.min.css");
    			attr_dev(link4, "rel", "stylesheet");
    			add_location(link4, file$g, 15, 2, 810);
    			attr_dev(link5, "href", "/Java/css/blog/custom.css");
    			attr_dev(link5, "rel", "stylesheet");
    			add_location(link5, file$g, 16, 2, 878);
    			attr_dev(link6, "href", "/Java/css/comming/coming-soon.css");
    			attr_dev(link6, "rel", "stylesheet");
    			add_location(link6, file$g, 17, 2, 938);
    			attr_dev(link7, "href", "/Java/css/comming/coming-soon.min.css");
    			attr_dev(link7, "rel", "stylesheet");
    			add_location(link7, file$g, 18, 2, 1006);
    			if (!src_url_equal(script0.src, script0_src_value = "/Java/vendor/comming/jquery/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$g, 21, 2, 1120);
    			if (!src_url_equal(script1.src, script1_src_value = "/Java/vendor/comming/bootstrap/js/bootstrap.bundle.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$g, 22, 2, 1189);
    			document.title = "Preparing Blog";
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$g, 27, 2, 1333);
    			if (!src_url_equal(source.src, source_src_value = "/Java/mp4/bg.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$g, 29, 4, 1449);
    			video.playsInline = "playsinline";
    			video.autoplay = "autoplay";
    			video.muted = "muted";
    			video.loop = "loop";
    			add_location(video, file$g, 28, 2, 1364);
    			attr_dev(div1, "class", "masthead-bg");
    			add_location(div1, file$g, 33, 4, 1543);
    			attr_dev(h1, "class", "mb-3");
    			add_location(h1, file$g, 38, 12, 1758);
    			add_location(strong0, file$g, 39, 42, 1833);
    			add_location(strong1, file$g, 39, 78, 1869);
    			attr_dev(p0, "class", "mb-5");
    			add_location(p0, file$g, 39, 12, 1803);
    			add_location(strong2, file$g, 40, 28, 1937);
    			add_location(strong3, file$g, 40, 71, 1980);
    			attr_dev(p1, "class", "mb-5");
    			add_location(p1, file$g, 40, 12, 1921);
    			add_location(br, file$g, 42, 13, 2093);
    			attr_dev(p2, "class", "mb-5");
    			add_location(p2, file$g, 41, 12, 2027);
    			add_location(p3, file$g, 44, 12, 2173);
    			attr_dev(input0, "name", "id");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "Input ID...");
    			attr_dev(input0, "aria-label", "Input ID...");
    			attr_dev(input0, "aria-discribedby", "submit-button");
    			add_location(input0, file$g, 47, 14, 2330);
    			attr_dev(input1, "name", "pw");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "placeholder", "Input PW...");
    			attr_dev(input1, "aria-label", "Input PW...");
    			attr_dev(input1, "aria-discribedby", "submit-button");
    			add_location(input1, file$g, 48, 14, 2468);
    			attr_dev(input2, "class", "btn btn-secondary");
    			attr_dev(input2, "type", "submit");
    			attr_dev(input2, "id", "submit-button");
    			input2.value = "관리자 접속";
    			add_location(input2, file$g, 49, 14, 2622);
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "action", "http://localhost:8080/login");
    			add_location(form, file$g, 46, 13, 2257);
    			attr_dev(div2, "class", "input-group input-group-newsletter");
    			add_location(div2, file$g, 45, 12, 2194);
    			attr_dev(div3, "class", "masthead-content text-white py-5 py-md-0");
    			add_location(div3, file$g, 37, 10, 1690);
    			attr_dev(div4, "class", "col-12 my-auto");
    			add_location(div4, file$g, 36, 8, 1650);
    			attr_dev(div5, "class", "row h-100");
    			add_location(div5, file$g, 35, 6, 1617);
    			attr_dev(div6, "class", "container h-100");
    			add_location(div6, file$g, 34, 4, 1580);
    			attr_dev(div7, "class", "masthead");
    			add_location(div7, file$g, 32, 2, 1515);
    			attr_dev(i0, "class", "fas fa-envelope");
    			add_location(i0, file$g, 69, 10, 3431);
    			attr_dev(a0, "href", "mailto:rodvkf72@naver.com");
    			add_location(a0, file$g, 68, 8, 3383);
    			attr_dev(li0, "class", "list-unstyled-item");
    			add_location(li0, file$g, 67, 6, 3342);
    			attr_dev(i1, "class", "fab fa-github");
    			add_location(i1, file$g, 74, 10, 3588);
    			attr_dev(a1, "href", "https://github.com/rodvkf72");
    			add_location(a1, file$g, 73, 8, 3538);
    			attr_dev(li1, "class", "list-unstyled-item");
    			add_location(li1, file$g, 72, 6, 3497);
    			attr_dev(ul, "class", "list-unstyled text-center mb-0");
    			add_location(ul, file$g, 66, 4, 3291);
    			attr_dev(div8, "class", "social-icons");
    			add_location(div8, file$g, 65, 2, 3259);
    			add_location(body, file$g, 26, 0, 1323);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, meta3);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, link3);
    			append_dev(document.head, link4);
    			append_dev(document.head, link5);
    			append_dev(document.head, link6);
    			append_dev(document.head, link7);
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, div0);
    			append_dev(body, t1);
    			append_dev(body, video);
    			append_dev(video, source);
    			append_dev(body, t2);
    			append_dev(body, div7);
    			append_dev(div7, div1);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t5);
    			append_dev(div3, p0);
    			append_dev(p0, t6);
    			append_dev(p0, strong0);
    			append_dev(p0, t8);
    			append_dev(p0, strong1);
    			append_dev(p0, t10);
    			append_dev(div3, t11);
    			append_dev(div3, p1);
    			append_dev(p1, strong2);
    			append_dev(p1, t13);
    			append_dev(p1, strong3);
    			append_dev(p1, t15);
    			append_dev(div3, t16);
    			append_dev(div3, p2);
    			append_dev(p2, t17);
    			append_dev(p2, br);
    			append_dev(p2, t18);
    			append_dev(div3, t19);
    			append_dev(div3, p3);
    			append_dev(div3, t20);
    			append_dev(div3, div2);
    			append_dev(div2, form);
    			append_dev(form, input0);
    			append_dev(form, t21);
    			append_dev(form, input1);
    			append_dev(form, t22);
    			append_dev(form, input2);
    			append_dev(body, t23);
    			append_dev(body, div8);
    			append_dev(div8, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, i0);
    			append_dev(ul, t24);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, i1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(link3);
    			detach_dev(link4);
    			detach_dev(link5);
    			detach_dev(link6);
    			detach_dev(link7);
    			detach_dev(script0);
    			detach_dev(script1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Java', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Java> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Java extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Java",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\Java\head.svelte generated by Svelte v3.48.0 */

    const file$f = "src\\Java\\head.svelte";

    function create_fragment$f(ctx) {
    	let meta0;
    	let meta1;
    	let meta2;
    	let meta3;
    	let script0;
    	let script0_src_value;
    	let link0;
    	let link1;
    	let link2;
    	let link3;
    	let link4;
    	let link5;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			script0 = element("script");
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			link3 = element("link");
    			link4 = element("link");
    			link5 = element("link");
    			script1 = element("script");
    			script2 = element("script");
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$f, 2, 2, 19);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, shrink-to-fit=no");
    			add_location(meta1, file$f, 3, 2, 45);
    			attr_dev(meta2, "name", "description");
    			attr_dev(meta2, "content", "");
    			add_location(meta2, file$f, 4, 2, 135);
    			attr_dev(meta3, "name", "author");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file$f, 5, 2, 175);
    			if (!src_url_equal(script0.src, script0_src_value = "/Java/vendor/comming/jquery/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$f, 7, 2, 212);
    			attr_dev(link0, "href", "/Java/vendor/blog/bootstrap/css/bootstrap.min.css");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$f, 10, 2, 314);
    			attr_dev(link1, "href", "/Java/vendor/blog/fontawesome-free/css/all.min.css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file$f, 13, 2, 443);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic");
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			add_location(link2, file$f, 14, 2, 544);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800");
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			add_location(link3, file$f, 15, 2, 667);
    			attr_dev(link4, "href", "/Java/css/blog/clean-blog.min.css");
    			attr_dev(link4, "rel", "stylesheet");
    			add_location(link4, file$f, 18, 2, 883);
    			attr_dev(link5, "href", "/Java/css/blog/custom.css");
    			attr_dev(link5, "rel", "stylesheet");
    			add_location(link5, file$f, 19, 2, 951);
    			if (!src_url_equal(script1.src, script1_src_value = "/Java/vendor/comming/bootstrap/js/bootstrap.bundle.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$f, 22, 2, 1053);
    			if (!src_url_equal(script2.src, script2_src_value = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$f, 23, 2, 1138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, meta3);
    			append_dev(document.head, script0);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, link3);
    			append_dev(document.head, link4);
    			append_dev(document.head, link5);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(script0);
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(link3);
    			detach_dev(link4);
    			detach_dev(link5);
    			detach_dev(script1);
    			detach_dev(script2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Head', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Head> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Head extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Head",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\Java\nav.svelte generated by Svelte v3.48.0 */

    const file$e = "src\\Java\\nav.svelte";

    function create_fragment$e(ctx) {
    	let nav;
    	let div1;
    	let a0;
    	let t1;
    	let button;
    	let t2;
    	let i;
    	let t3;
    	let div0;
    	let ul;
    	let li0;
    	let a1;
    	let t5;
    	let li1;
    	let a2;
    	let t7;
    	let li2;
    	let a3;
    	let t9;
    	let li3;
    	let a4;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Kim's Log";
    			t1 = space();
    			button = element("button");
    			t2 = text("Menu\r\n        ");
    			i = element("i");
    			t3 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t5 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "NoticeBoard";
    			t7 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Project";
    			t9 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Online Judge";
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "/main");
    			add_location(a0, file$e, 5, 6, 135);
    			attr_dev(i, "class", "fas fa-bars");
    			add_location(i, file$e, 8, 8, 424);
    			attr_dev(button, "class", "navbar-toggler navbar-toggler-right");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarResponsive");
    			attr_dev(button, "aria-controls", "navbarResponsive");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$e, 6, 6, 193);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "/main");
    			add_location(a1, file$e, 13, 12, 624);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$e, 12, 10, 589);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "/noticeboard/1");
    			add_location(a2, file$e, 16, 12, 729);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$e, 15, 10, 694);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "/project");
    			add_location(a3, file$e, 19, 12, 850);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file$e, 18, 10, 815);
    			attr_dev(a4, "class", "nav-link");
    			attr_dev(a4, "href", "/coding");
    			add_location(a4, file$e, 34, 12, 1433);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file$e, 21, 10, 926);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file$e, 11, 8, 546);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarResponsive");
    			add_location(div0, file$e, 10, 6, 476);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$e, 4, 4, 104);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light fixed-top");
    			attr_dev(nav, "id", "mainNav");
    			add_location(nav, file$e, 3, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, t2);
    			append_dev(button, i);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(ul, t9);
    			append_dev(ul, li3);
    			append_dev(li3, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\Java\footer.svelte generated by Svelte v3.48.0 */

    const file$d = "src\\Java\\footer.svelte";

    function create_fragment$d(ctx) {
    	let footer;
    	let div2;
    	let div1;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let span0;
    	let i0;
    	let t0;
    	let i1;
    	let t1;
    	let li1;
    	let a1;
    	let span1;
    	let i2;
    	let t2;
    	let i3;
    	let t3;
    	let li2;
    	let a2;
    	let span2;
    	let i4;
    	let t4;
    	let i5;
    	let t5;
    	let p;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			span0 = element("span");
    			i0 = element("i");
    			t0 = space();
    			i1 = element("i");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			span1 = element("span");
    			i2 = element("i");
    			t2 = space();
    			i3 = element("i");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			span2 = element("span");
    			i4 = element("i");
    			t4 = space();
    			i5 = element("i");
    			t5 = space();
    			p = element("p");
    			p.textContent = "Copyright © Your Website 2022";
    			attr_dev(i0, "class", "fas fa-circle fa-stack-2x");
    			add_location(i0, file$d, 9, 18, 315);
    			attr_dev(i1, "class", "fab fa-twitter fa-stack-1x fa-inverse");
    			add_location(i1, file$d, 10, 18, 376);
    			attr_dev(span0, "class", "fa-stack fa-lg");
    			add_location(span0, file$d, 8, 16, 266);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$d, 7, 14, 236);
    			attr_dev(li0, "class", "list-inline-item");
    			add_location(li0, file$d, 6, 12, 191);
    			attr_dev(i2, "class", "fas fa-circle fa-stack-2x");
    			add_location(i2, file$d, 17, 18, 631);
    			attr_dev(i3, "class", "fab fa-facebook-f fa-stack-1x fa-inverse");
    			add_location(i3, file$d, 18, 18, 692);
    			attr_dev(span1, "class", "fa-stack fa-lg");
    			add_location(span1, file$d, 16, 16, 582);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$d, 15, 14, 552);
    			attr_dev(li1, "class", "list-inline-item");
    			add_location(li1, file$d, 14, 12, 507);
    			attr_dev(i4, "class", "fas fa-circle fa-stack-2x");
    			add_location(i4, file$d, 25, 18, 976);
    			attr_dev(i5, "class", "fab fa-github fa-stack-1x fa-inverse");
    			add_location(i5, file$d, 26, 18, 1037);
    			attr_dev(span2, "class", "fa-stack fa-lg");
    			add_location(span2, file$d, 24, 16, 927);
    			attr_dev(a2, "href", "https://github.com/rodvkf72");
    			add_location(a2, file$d, 23, 14, 871);
    			attr_dev(li2, "class", "list-inline-item");
    			add_location(li2, file$d, 22, 12, 826);
    			attr_dev(ul, "class", "list-inline text-center");
    			add_location(ul, file$d, 5, 10, 141);
    			attr_dev(p, "class", "copyright text-muted");
    			add_location(p, file$d, 31, 10, 1182);
    			attr_dev(div0, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div0, file$d, 4, 8, 89);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$d, 3, 6, 62);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$d, 2, 4, 31);
    			add_location(footer, file$d, 1, 0, 17);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, span0);
    			append_dev(span0, i0);
    			append_dev(span0, t0);
    			append_dev(span0, i1);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, span1);
    			append_dev(span1, i2);
    			append_dev(span1, t2);
    			append_dev(span1, i3);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, span2);
    			append_dev(span2, i4);
    			append_dev(span2, t4);
    			append_dev(span2, i5);
    			append_dev(div0, t5);
    			append_dev(div0, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\Java\main.svelte generated by Svelte v3.48.0 */

    const file$c = "src\\Java\\main.svelte";

    function create_fragment$c(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br0;
    	let t3;
    	let span;
    	let t5;
    	let div8;
    	let div7;
    	let div6;
    	let div5;
    	let h2;
    	let t7;
    	let hr0;
    	let t8;
    	let p0;
    	let t9;
    	let br1;
    	let br2;
    	let t10;
    	let br3;
    	let br4;
    	let t11;
    	let br5;
    	let t12;
    	let br6;
    	let br7;
    	let t13;
    	let br8;
    	let br9;
    	let t14;
    	let br10;
    	let t15;
    	let p1;
    	let t17;
    	let hr1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Kim's Log";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			span = element("span");
    			span.textContent = "풀 스택을 향해 나아가는 개발자";
    			t5 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			h2 = element("h2");
    			h2.textContent = "About";
    			t7 = space();
    			hr0 = element("hr");
    			t8 = space();
    			p0 = element("p");
    			t9 = text("이 블로그는 Go언어로 작성된 블로그를 Java로 재구성 한 것입니다.");
    			br1 = element("br");
    			br2 = element("br");
    			t10 = text("\r\n                    백엔드와 프론트엔드 서버가 분리되어 있으며 기술 스택은 아래와 같습니다.");
    			br3 = element("br");
    			br4 = element("br");
    			t11 = text("\r\n                    백엔드 : Java, Spring Boot, mybatis, Mysql");
    			br5 = element("br");
    			t12 = text("\r\n                    프론트엔드 : Svelte, Javascript, HTML, css");
    			br6 = element("br");
    			br7 = element("br");
    			t13 = text("\r\n                    디자인은 Bootstrap Template을 사용하였습니다.");
    			br8 = element("br");
    			br9 = element("br");
    			t14 = text("\r\n                    구성요소로는 게시판, 진행했던 프로젝트, 온라인 저지 문제 풀이가 있습니다.");
    			br10 = element("br");
    			t15 = space();
    			p1 = element("p");
    			p1.textContent = "Made By KHKI";
    			t17 = space();
    			hr1 = element("hr");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$c, 1, 4, 88);
    			add_location(h1, file$c, 6, 18, 289);
    			add_location(br0, file$c, 7, 18, 327);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$c, 8, 18, 351);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$c, 5, 16, 243);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$c, 4, 12, 185);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$c, 3, 8, 154);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$c, 2, 4, 121);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$c, 0, 0, 0);
    			attr_dev(h2, "class", "post-title");
    			set_style(h2, "text-align", "center");
    			add_location(h2, file$c, 20, 16, 678);
    			set_style(hr0, "width", "10%");
    			add_location(hr0, file$c, 23, 16, 796);
    			add_location(br1, file$c, 25, 59, 951);
    			add_location(br2, file$c, 25, 63, 955);
    			add_location(br3, file$c, 26, 60, 1021);
    			add_location(br4, file$c, 26, 64, 1025);
    			add_location(br5, file$c, 27, 59, 1090);
    			add_location(br6, file$c, 28, 57, 1153);
    			add_location(br7, file$c, 28, 61, 1157);
    			add_location(br8, file$c, 29, 53, 1216);
    			add_location(br9, file$c, 29, 57, 1220);
    			add_location(br10, file$c, 30, 62, 1288);
    			attr_dev(p0, "class", "post-subtitle");
    			set_style(p0, "text-align", "center");
    			add_location(p0, file$c, 24, 16, 838);
    			attr_dev(p1, "class", "post-meta");
    			set_style(p1, "text-align", "center");
    			add_location(p1, file$c, 32, 16, 1332);
    			attr_dev(div5, "class", "post-preview");
    			add_location(div5, file$c, 19, 12, 634);
    			add_location(hr1, file$c, 34, 12, 1430);
    			attr_dev(div6, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div6, file$c, 18, 8, 580);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$c, 17, 4, 553);
    			attr_dev(div8, "class", "container");
    			add_location(div8, file$c, 16, 0, 524);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br0);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h2);
    			append_dev(div5, t7);
    			append_dev(div5, hr0);
    			append_dev(div5, t8);
    			append_dev(div5, p0);
    			append_dev(p0, t9);
    			append_dev(p0, br1);
    			append_dev(p0, br2);
    			append_dev(p0, t10);
    			append_dev(p0, br3);
    			append_dev(p0, br4);
    			append_dev(p0, t11);
    			append_dev(p0, br5);
    			append_dev(p0, t12);
    			append_dev(p0, br6);
    			append_dev(p0, br7);
    			append_dev(p0, t13);
    			append_dev(p0, br8);
    			append_dev(p0, br9);
    			append_dev(p0, t14);
    			append_dev(p0, br10);
    			append_dev(div5, t15);
    			append_dev(div5, p1);
    			append_dev(div6, t17);
    			append_dev(div6, hr1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\Java\coding.svelte generated by Svelte v3.48.0 */

    const file$b = "src\\Java\\coding.svelte";

    function create_fragment$b(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br0;
    	let t3;
    	let span;
    	let t5;
    	let div7;
    	let div6;
    	let div5;
    	let hr0;
    	let t6;
    	let br1;
    	let a;
    	let br2;
    	let t8;
    	let hr1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "코 딩 문 제";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			span = element("span");
    			span.textContent = "Online Judge 문 제 풀 이";
    			t5 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			hr0 = element("hr");
    			t6 = space();
    			br1 = element("br");
    			a = element("a");
    			a.textContent = "Baekjoon Online Judge";
    			br2 = element("br");
    			t8 = text(" \r\n      \t\r\n      \t\r\n         \r\n        \r\n        \r\n        ");
    			hr1 = element("hr");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$b, 2, 4, 114);
    			add_location(h1, file$b, 7, 12, 297);
    			add_location(br0, file$b, 8, 12, 327);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$b, 9, 12, 345);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$b, 6, 10, 257);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$b, 5, 8, 205);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$b, 4, 6, 178);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$b, 3, 4, 147);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$b, 1, 2, 26);
    			add_location(hr0, file$b, 20, 7, 632);
    			add_location(br1, file$b, 21, 7, 645);
    			attr_dev(a, "href", "/coding/b_judge/1");
    			add_location(a, file$b, 21, 11, 649);
    			add_location(br2, file$b, 21, 64, 702);
    			add_location(hr1, file$b, 70, 8, 2310);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			set_style(div5, "text-align", "center");
    			add_location(div5, file$b, 19, 6, 555);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$b, 18, 4, 530);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$b, 17, 2, 501);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br0);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, hr0);
    			append_dev(div5, t6);
    			append_dev(div5, br1);
    			append_dev(div5, a);
    			append_dev(div5, br2);
    			append_dev(div5, t8);
    			append_dev(div5, hr1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Coding', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Coding> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Coding extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Coding",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\Java\bjudge.svelte generated by Svelte v3.48.0 */
    const file$a = "src\\Java\\bjudge.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (78:12) {#each resultList as item}
    function create_each_block$4(ctx) {
    	let tbody;
    	let td0;
    	let hr0;
    	let t0;
    	let br0;
    	let t1_value = /*item*/ ctx[3].no + "";
    	let t1;
    	let br1;
    	let t2;
    	let t3;
    	let td1;
    	let hr1;
    	let t4;
    	let br2;
    	let a;
    	let t5_value = /*item*/ ctx[3].title + "";
    	let t5;
    	let a_href_value;
    	let br3;
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			tbody = element("tbody");
    			td0 = element("td");
    			hr0 = element("hr");
    			t0 = text(" ");
    			br0 = element("br");
    			t1 = text(t1_value);
    			br1 = element("br");
    			t2 = text(" ");
    			t3 = space();
    			td1 = element("td");
    			hr1 = element("hr");
    			t4 = text(" ");
    			br2 = element("br");
    			a = element("a");
    			t5 = text(t5_value);
    			br3 = element("br");
    			t6 = text(" ");
    			t7 = space();
    			add_location(hr0, file$a, 79, 20, 1870);
    			add_location(br0, file$a, 79, 30, 1880);
    			add_location(br1, file$a, 79, 43, 1893);
    			add_location(td0, file$a, 79, 16, 1866);
    			add_location(hr1, file$a, 80, 20, 1930);
    			add_location(br2, file$a, 80, 30, 1940);
    			attr_dev(a, "href", a_href_value = "/coding/b_judge/view/" + /*item*/ ctx[3].no);
    			add_location(a, file$a, 80, 34, 1944);
    			add_location(br3, file$a, 80, 91, 2001);
    			add_location(td1, file$a, 80, 16, 1926);
    			set_style(tbody, "text-align", "center");
    			add_location(tbody, file$a, 78, 14, 1813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, td0);
    			append_dev(td0, hr0);
    			append_dev(td0, t0);
    			append_dev(td0, br0);
    			append_dev(td0, t1);
    			append_dev(td0, br1);
    			append_dev(td0, t2);
    			append_dev(tbody, t3);
    			append_dev(tbody, td1);
    			append_dev(td1, hr1);
    			append_dev(td1, t4);
    			append_dev(td1, br2);
    			append_dev(td1, a);
    			append_dev(a, t5);
    			append_dev(td1, br3);
    			append_dev(td1, t6);
    			append_dev(tbody, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 1 && t1_value !== (t1_value = /*item*/ ctx[3].no + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*resultList*/ 1 && t5_value !== (t5_value = /*item*/ ctx[3].title + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*resultList*/ 1 && a_href_value !== (a_href_value = "/coding/b_judge/view/" + /*item*/ ctx[3].no)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(78:12) {#each resultList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br;
    	let t3;
    	let span;
    	let t5;
    	let div7;
    	let div6;
    	let div5;
    	let table;
    	let thread;
    	let tr;
    	let th0;
    	let b0;
    	let t7;
    	let th1;
    	let b1;
    	let t9;
    	let t10;
    	let hr;
    	let each_value = /*resultList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "백 준";
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			span = element("span");
    			span.textContent = "문 제 풀 이";
    			t5 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			table = element("table");
    			thread = element("thread");
    			tr = element("tr");
    			th0 = element("th");
    			b0 = element("b");
    			b0.textContent = "번 호";
    			t7 = space();
    			th1 = element("th");
    			b1 = element("b");
    			b1.textContent = "문 제";
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			hr = element("hr");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$a, 52, 4, 1041);
    			add_location(h1, file$a, 57, 12, 1224);
    			add_location(br, file$a, 58, 12, 1250);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$a, 59, 12, 1268);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$a, 56, 10, 1184);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$a, 55, 8, 1132);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$a, 54, 6, 1105);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$a, 53, 4, 1074);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$a, 51, 0, 953);
    			add_location(b0, file$a, 73, 25, 1668);
    			attr_dev(th0, "width", "30%");
    			add_location(th0, file$a, 73, 9, 1652);
    			add_location(b1, file$a, 74, 25, 1710);
    			attr_dev(th1, "width", "70%");
    			add_location(th1, file$a, 74, 9, 1694);
    			set_style(tr, "background-color", "rgb(230, 230, 230)");
    			set_style(tr, "text-align", "center");
    			add_location(tr, file$a, 72, 7, 1571);
    			add_location(thread, file$a, 71, 7, 1554);
    			attr_dev(table, "width", "100%;");
    			attr_dev(table, "id", "tbl");
    			add_location(table, file$a, 70, 8, 1515);
    			add_location(hr, file$a, 87, 8, 2133);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div5, file$a, 69, 6, 1465);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$a, 68, 4, 1440);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$a, 67, 2, 1411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, table);
    			append_dev(table, thread);
    			append_dev(thread, tr);
    			append_dev(tr, th0);
    			append_dev(th0, b0);
    			append_dev(tr, t7);
    			append_dev(tr, th1);
    			append_dev(th1, b1);
    			append_dev(table, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(div5, t10);
    			append_dev(div5, hr);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resultList*/ 1) {
    				each_value = /*resultList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bjudge', slots, []);
    	let { page } = $$props;
    	let resultList = [];

    	/*
      onMount(async() => {
        let list = [];
        let result = fetch('http://localhost:8080/b_judge/' + page,
          {
            method: 'POST',
            headers: {
              "Content-Type" : "application/json",
            }
          }
        ).then((res) => {
          return res.json();
        }).then((json) => {
          list.json;
        });
        
        await result;
        resultList = list.list;
      })
    */
    	async function solvedList() {
    		let list = [];

    		let result = fetch('http://localhost:8080/b_judge/' + page, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;
    		});

    		await result;
    		$$invalidate(0, resultList = list.list);
    	}

    	solvedList();
    	const writable_props = ['page'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bjudge> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({ onMount, page, resultList, solvedList });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('resultList' in $$props) $$invalidate(0, resultList = $$props.resultList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resultList, page];
    }

    class Bjudge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { page: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bjudge",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[1] === undefined && !('page' in props)) {
    			console.warn("<Bjudge> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Bjudge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Bjudge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Java\bjudgepost.svelte generated by Svelte v3.48.0 */
    const file$9 = "src\\Java\\bjudgepost.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (69:12) {#each resultList as item}
    function create_each_block$3(ctx) {
    	let h1;
    	let t0_value = /*item*/ ctx[3].title + "";
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let span;
    	let t3;
    	let t4_value = /*item*/ ctx[3].writer + "";
    	let t4;
    	let t5;
    	let t6_value = /*item*/ ctx[3].date + "";
    	let t6;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			span = element("span");
    			t3 = text("Posted by ");
    			t4 = text(t4_value);
    			t5 = text(" on ");
    			t6 = text(t6_value);
    			add_location(h1, file$9, 69, 14, 1582);
    			add_location(br, file$9, 70, 14, 1621);
    			attr_dev(span, "class", "meta");
    			add_location(span, file$9, 71, 14, 1641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			append_dev(span, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 1 && t0_value !== (t0_value = /*item*/ ctx[3].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resultList*/ 1 && t4_value !== (t4_value = /*item*/ ctx[3].writer + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*resultList*/ 1 && t6_value !== (t6_value = /*item*/ ctx[3].date + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(69:12) {#each resultList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let t1;
    	let br0;
    	let t2;
    	let article;
    	let div7;
    	let div6;
    	let div5;
    	let t3;
    	let br1;
    	let t4;
    	let hr;
    	let each_value = /*resultList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			article = element("article");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			hr = element("hr");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$9, 62, 4, 1355);
    			add_location(br0, file$9, 75, 12, 1805);
    			attr_dev(div1, "class", "post-heading");
    			add_location(div1, file$9, 66, 10, 1498);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$9, 65, 8, 1446);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$9, 64, 6, 1419);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$9, 63, 4, 1388);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/post-bg.jpg')");
    			add_location(header, file$9, 61, 0, 1267);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div5, file$9, 88, 8, 2172);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$9, 87, 6, 2145);
    			add_location(br1, file$9, 92, 6, 2283);
    			add_location(hr, file$9, 93, 6, 2295);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$9, 86, 4, 2114);
    			add_location(article, file$9, 85, 2, 2099);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, br0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			div5.innerHTML = /*resultContent*/ ctx[1];
    			append_dev(div7, t3);
    			append_dev(div7, br1);
    			append_dev(div7, t4);
    			append_dev(div7, hr);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resultList*/ 1) {
    				each_value = /*resultList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*resultContent*/ 2) div5.innerHTML = /*resultContent*/ ctx[1];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bjudgepost', slots, []);
    	let { no } = $$props;
    	let resultList = [];
    	let resultContent;

    	onMount(async () => {
    		let list = [];

    		let result = fetch('http://localhost:8080/b_judge/view/' + no, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;
    		});

    		await result;
    		$$invalidate(0, resultList = list.list);
    		$$invalidate(1, resultContent = resultList[0].content);
    	});

    	const writable_props = ['no'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bjudgepost> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('no' in $$props) $$invalidate(2, no = $$props.no);
    	};

    	$$self.$capture_state = () => ({ onMount, no, resultList, resultContent });

    	$$self.$inject_state = $$props => {
    		if ('no' in $$props) $$invalidate(2, no = $$props.no);
    		if ('resultList' in $$props) $$invalidate(0, resultList = $$props.resultList);
    		if ('resultContent' in $$props) $$invalidate(1, resultContent = $$props.resultContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resultList, resultContent, no];
    }

    class Bjudgepost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { no: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bjudgepost",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*no*/ ctx[2] === undefined && !('no' in props)) {
    			console.warn("<Bjudgepost> was created without expected prop 'no'");
    		}
    	}

    	get no() {
    		throw new Error("<Bjudgepost>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set no(value) {
    		throw new Error("<Bjudgepost>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Java\project.svelte generated by Svelte v3.48.0 */

    const file$8 = "src\\Java\\project.svelte";

    function create_fragment$8(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br;
    	let t3;
    	let span;
    	let t5;
    	let div50;
    	let div49;
    	let div48;
    	let div47;
    	let div7;
    	let div6;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let div5;
    	let h40;
    	let a1;
    	let t8;
    	let h50;
    	let t10;
    	let p0;
    	let t12;
    	let div10;
    	let div9;
    	let a2;
    	let img1;
    	let img1_src_value;
    	let t13;
    	let div8;
    	let h41;
    	let a3;
    	let t15;
    	let h51;
    	let t17;
    	let p1;
    	let t19;
    	let div13;
    	let div12;
    	let a4;
    	let img2;
    	let img2_src_value;
    	let t20;
    	let div11;
    	let h42;
    	let a5;
    	let t22;
    	let h52;
    	let t24;
    	let p2;
    	let t26;
    	let div16;
    	let div15;
    	let a6;
    	let img3;
    	let img3_src_value;
    	let t27;
    	let div14;
    	let h43;
    	let a7;
    	let t29;
    	let h53;
    	let t31;
    	let p3;
    	let t33;
    	let div19;
    	let div18;
    	let a8;
    	let img4;
    	let img4_src_value;
    	let t34;
    	let div17;
    	let h44;
    	let a9;
    	let t36;
    	let h54;
    	let t38;
    	let p4;
    	let t40;
    	let div22;
    	let div21;
    	let a10;
    	let img5;
    	let img5_src_value;
    	let t41;
    	let div20;
    	let h45;
    	let a11;
    	let t43;
    	let h55;
    	let t45;
    	let p5;
    	let t47;
    	let div25;
    	let div24;
    	let a12;
    	let img6;
    	let img6_src_value;
    	let t48;
    	let div23;
    	let h46;
    	let a13;
    	let t50;
    	let h56;
    	let t52;
    	let p6;
    	let t54;
    	let div28;
    	let div27;
    	let a14;
    	let img7;
    	let img7_src_value;
    	let t55;
    	let div26;
    	let h47;
    	let a15;
    	let t57;
    	let h57;
    	let t59;
    	let p7;
    	let t61;
    	let div31;
    	let div30;
    	let a16;
    	let img8;
    	let img8_src_value;
    	let t62;
    	let div29;
    	let h48;
    	let a17;
    	let t64;
    	let h58;
    	let t66;
    	let p8;
    	let t68;
    	let div34;
    	let div33;
    	let a18;
    	let img9;
    	let img9_src_value;
    	let t69;
    	let div32;
    	let h49;
    	let a19;
    	let t71;
    	let h59;
    	let t73;
    	let p9;
    	let t75;
    	let div37;
    	let div36;
    	let a20;
    	let img10;
    	let img10_src_value;
    	let t76;
    	let div35;
    	let h410;
    	let a21;
    	let t78;
    	let h510;
    	let t80;
    	let p10;
    	let t82;
    	let div40;
    	let div39;
    	let a22;
    	let img11;
    	let img11_src_value;
    	let t83;
    	let div38;
    	let h411;
    	let a23;
    	let t85;
    	let h511;
    	let t87;
    	let p11;
    	let t89;
    	let div43;
    	let div42;
    	let a24;
    	let img12;
    	let img12_src_value;
    	let t90;
    	let div41;
    	let h412;
    	let a25;
    	let t92;
    	let h512;
    	let t94;
    	let p12;
    	let t96;
    	let div46;
    	let div45;
    	let a26;
    	let img13;
    	let img13_src_value;
    	let t97;
    	let div44;
    	let h413;
    	let a27;
    	let t99;
    	let h513;
    	let t101;
    	let p13;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "프 로 젝 트";
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			span = element("span");
    			span.textContent = "이 때 까 지 한 프 로 젝 트";
    			t5 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div48 = element("div");
    			div47 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t6 = space();
    			div5 = element("div");
    			h40 = element("h4");
    			a1 = element("a");
    			a1.textContent = "개인 블로그 - Java";
    			t8 = space();
    			h50 = element("h5");
    			h50.textContent = "Java(Spring Boot), MySQL, mybatis";
    			t10 = space();
    			p0 = element("p");
    			p0.textContent = "현재 보고 있는 이 페이지로 Go언어로 제작한 블로그를 Java, jsp 코드로 변경하고 Bootstrap Template를 사용하여 디자인 하였습니다.";
    			t12 = space();
    			div10 = element("div");
    			div9 = element("div");
    			a2 = element("a");
    			img1 = element("img");
    			t13 = space();
    			div8 = element("div");
    			h41 = element("h4");
    			a3 = element("a");
    			a3.textContent = "개인 블로그 - Go";
    			t15 = space();
    			h51 = element("h5");
    			h51.textContent = "Go(Echo), MySQL, Docker";
    			t17 = space();
    			p1 = element("p");
    			p1.textContent = "Go언어를 공부하던 중 웹 개발이 가능한 것을 알고 '웹을 만들면서 공부하면 더 학습이 잘 되지 않을까?' 라는 생각으로 제작하게 되었습니다.";
    			t19 = space();
    			div13 = element("div");
    			div12 = element("div");
    			a4 = element("a");
    			img2 = element("img");
    			t20 = space();
    			div11 = element("div");
    			h42 = element("h4");
    			a5 = element("a");
    			a5.textContent = "간편결제 쇼핑몰";
    			t22 = space();
    			h52 = element("h5");
    			h52.textContent = "Java(Spring4), Oracle, mybatis, Apache Tomcat";
    			t24 = space();
    			p2 = element("p");
    			p2.textContent = "카드를 등록하여 간단한 비밀번호 입력으로 서비스나 상품을 구매할 수 있게 하여 사용자에게 편리한 결제 방식을 제공하도록 하였습니다.";
    			t26 = space();
    			div16 = element("div");
    			div15 = element("div");
    			a6 = element("a");
    			img3 = element("img");
    			t27 = space();
    			div14 = element("div");
    			h43 = element("h4");
    			a7 = element("a");
    			a7.textContent = "여행 애플리케이션";
    			t29 = space();
    			h53 = element("h5");
    			h53.textContent = "Java(Android Studio), Go, MySQL";
    			t31 = space();
    			p3 = element("p");
    			p3.textContent = "여행 동행자 모집 및 주변 여행 정보 획득을 위한 애플리케이션 입니다. 차이점은 동행모집 게시판, 관광지 선호도, 인증 시스템이 있습니다.";
    			t33 = space();
    			div19 = element("div");
    			div18 = element("div");
    			a8 = element("a");
    			img4 = element("img");
    			t34 = space();
    			div17 = element("div");
    			h44 = element("h4");
    			a9 = element("a");
    			a9.textContent = "웹 메일 시스템 유지/보수";
    			t36 = space();
    			h54 = element("h5");
    			h54.textContent = "Java, jsp";
    			t38 = space();
    			p4 = element("p");
    			p4.textContent = "주어진 웹 메일 시스템에 대해 예방, 완전화, 수정, 적응 유지보수를 진행한 프로젝트 입니다.";
    			t40 = space();
    			div22 = element("div");
    			div21 = element("div");
    			a10 = element("a");
    			img5 = element("img");
    			t41 = space();
    			div20 = element("div");
    			h45 = element("h4");
    			a11 = element("a");
    			a11.textContent = "자동 차량 결제 애플리케이션";
    			t43 = space();
    			h55 = element("h5");
    			h55.textContent = "Java(Android Studio), php, MySQL";
    			t45 = space();
    			p5 = element("p");
    			p5.textContent = "OCR 기술로 번호판 인식을 통해 차량으로 결제를 지원하는 애플리케이션(결제 미구현) 입니다.";
    			t47 = space();
    			div25 = element("div");
    			div24 = element("div");
    			a12 = element("a");
    			img6 = element("img");
    			t48 = space();
    			div23 = element("div");
    			h46 = element("h4");
    			a13 = element("a");
    			a13.textContent = "건축정보 모바일 서비스 콘텐츠 개발 공모전";
    			t50 = space();
    			h56 = element("h5");
    			h56.textContent = "Java(Android Studio), php, MySQL";
    			t52 = space();
    			p6 = element("p");
    			p6.textContent = "건축 대장 정보나 건축물의 상태 기입을 효율적으로 하기 위한 애플리케이션 입니다.";
    			t54 = space();
    			div28 = element("div");
    			div27 = element("div");
    			a14 = element("a");
    			img7 = element("img");
    			t55 = space();
    			div26 = element("div");
    			h47 = element("h4");
    			a15 = element("a");
    			a15.textContent = "자율주행 프로그램";
    			t57 = space();
    			h57 = element("h5");
    			h57.textContent = "Python, ROS(Robot Operating System), Gazebo";
    			t59 = space();
    			p7 = element("p");
    			p7.textContent = "주어진 미로에 대한 목적지 도착 및 백트래킹, 주행시험장 신호와 차선을 지키며 목적지에 도착하는 프로그램 입니다.";
    			t61 = space();
    			div31 = element("div");
    			div30 = element("div");
    			a16 = element("a");
    			img8 = element("img");
    			t62 = space();
    			div29 = element("div");
    			h48 = element("h4");
    			a17 = element("a");
    			a17.textContent = "서비스 센터 프로그램";
    			t64 = space();
    			h58 = element("h5");
    			h58.textContent = "Pro C";
    			t66 = space();
    			p8 = element("p");
    			p8.textContent = "가상의 전자 제품 기업을 상정하고 해당 기업에서 사용하는 서비스 소프트웨어를 개발한다는 내용이며 프로그램 기능보다는 DB의 설계와 구현에 초점을 두었습니다.";
    			t68 = space();
    			div34 = element("div");
    			div33 = element("div");
    			a18 = element("a");
    			img9 = element("img");
    			t69 = space();
    			div32 = element("div");
    			h49 = element("h4");
    			a19 = element("a");
    			a19.textContent = "인사관리 프로그램";
    			t71 = space();
    			h59 = element("h5");
    			h59.textContent = "Java";
    			t73 = space();
    			p9 = element("p");
    			p9.textContent = "디자인 패턴을 사용하여 제작된 인사관리 프로그램 입니다. 사용된 패턴은 스트래티지 패턴, 이터레이터 패턴, 원격 프록시 패턴, 메멘토 패턴, 커맨드 패턴 입니다.";
    			t75 = space();
    			div37 = element("div");
    			div36 = element("div");
    			a20 = element("a");
    			img10 = element("img");
    			t76 = space();
    			div35 = element("div");
    			h410 = element("h4");
    			a21 = element("a");
    			a21.textContent = "장르 통합형 웹 사이트";
    			t78 = space();
    			h510 = element("h5");
    			h510.textContent = "html, css, javascript, php";
    			t80 = space();
    			p10 = element("p");
    			p10.textContent = "사용자의 다양한 요구를 만족시키기 위해 하나에 국한되지 않는 다양한 콘텐츠를 제공하고자 하는 목적으로 제작되었습니다.";
    			t82 = space();
    			div40 = element("div");
    			div39 = element("div");
    			a22 = element("a");
    			img11 = element("img");
    			t83 = space();
    			div38 = element("div");
    			h411 = element("h4");
    			a23 = element("a");
    			a23.textContent = "AR 구현동화(캡스톤 보고서 형식)";
    			t85 = space();
    			h511 = element("h5");
    			h511.textContent = "Unity Vuforia";
    			t87 = space();
    			p11 = element("p");
    			p11.textContent = "AR로 구현동화를 만들어 양방향성의 콘텐츠로 만들어 교육 효율을 높이자는 생각으로 기획되었습니다.";
    			t89 = space();
    			div43 = element("div");
    			div42 = element("div");
    			a24 = element("a");
    			img12 = element("img");
    			t90 = space();
    			div41 = element("div");
    			h412 = element("h4");
    			a25 = element("a");
    			a25.textContent = "관광지 주변시설 위치 확인 프로그램";
    			t92 = space();
    			h512 = element("h5");
    			h512.textContent = "Java";
    			t94 = space();
    			p12 = element("p");
    			p12.textContent = "공공 데이터 API를 활용하여 관광지에 대한 핵심정보 뿐만 아니라 주변의 편의시설, 관련정보 등을 하나의 프로그램으로 통합하였습니다.";
    			t96 = space();
    			div46 = element("div");
    			div45 = element("div");
    			a26 = element("a");
    			img13 = element("img");
    			t97 = space();
    			div44 = element("div");
    			h413 = element("h4");
    			a27 = element("a");
    			a27.textContent = "캐릭터 달리기 게임";
    			t99 = space();
    			h513 = element("h5");
    			h513.textContent = "MFC";
    			t101 = space();
    			p13 = element("p");
    			p13.textContent = "쿠키런 이라는 게임을 MFC로 구현하고 몇 가지 추가사항을 더하면 더욱 재밌는 게임을 만들 수 있을 것 같다는 생각으로 제작되었습니다.";
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$8, 1, 4, 93);
    			add_location(h1, file$8, 6, 12, 276);
    			add_location(br, file$8, 7, 12, 306);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$8, 8, 12, 324);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$8, 5, 10, 236);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$8, 4, 8, 184);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$8, 3, 6, 157);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$8, 2, 4, 126);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/resources/image/home-bg.jpg')");
    			add_location(header, file$8, 0, 0, 0);
    			attr_dev(img0, "class", "card-img-top");
    			if (!src_url_equal(img0.src, img0_src_value = "../../resources/image/springboot.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$8, 30, 61, 779);
    			attr_dev(a0, "href", "https://github.com/rodvkf72/java_web");
    			add_location(a0, file$8, 30, 14, 732);
    			attr_dev(a1, "href", "https://github.com/rodvkf72/java_web");
    			add_location(a1, file$8, 33, 18, 959);
    			attr_dev(h40, "class", "card-title");
    			add_location(h40, file$8, 32, 16, 916);
    			add_location(h50, file$8, 35, 16, 1064);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$8, 36, 16, 1124);
    			attr_dev(div5, "class", "card-body");
    			add_location(div5, file$8, 31, 14, 875);
    			attr_dev(div6, "class", "card h-100");
    			add_location(div6, file$8, 29, 12, 692);
    			attr_dev(div7, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div7, file$8, 28, 8, 642);
    			attr_dev(img1, "class", "card-img-top");
    			if (!src_url_equal(img1.src, img1_src_value = "../../resources/image/echo.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$8, 48, 59, 1648);
    			attr_dev(a2, "href", "https://github.com/rodvkf72/GO_WEB");
    			add_location(a2, file$8, 48, 14, 1603);
    			attr_dev(a3, "href", "https://github.com/rodvkf72/GO_WEB");
    			add_location(a3, file$8, 51, 18, 1822);
    			attr_dev(h41, "class", "card-title");
    			add_location(h41, file$8, 50, 16, 1779);
    			add_location(h51, file$8, 53, 16, 1923);
    			attr_dev(p1, "class", "card-text");
    			add_location(p1, file$8, 54, 16, 1973);
    			attr_dev(div8, "class", "card-body");
    			add_location(div8, file$8, 49, 14, 1738);
    			attr_dev(div9, "class", "card h-100");
    			add_location(div9, file$8, 47, 12, 1563);
    			attr_dev(div10, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div10, file$8, 46, 10, 1513);
    			attr_dev(img2, "class", "card-img-top");
    			if (!src_url_equal(img2.src, img2_src_value = "../../resources/image/spring4.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$8, 66, 59, 2491);
    			attr_dev(a4, "href", "https://github.com/rodvkf72/PayDay");
    			add_location(a4, file$8, 66, 14, 2446);
    			attr_dev(a5, "href", "https://github.com/rodvkf72/PayDay");
    			add_location(a5, file$8, 69, 18, 2668);
    			attr_dev(h42, "class", "card-title");
    			add_location(h42, file$8, 68, 16, 2625);
    			add_location(h52, file$8, 71, 16, 2766);
    			attr_dev(p2, "class", "card-text");
    			add_location(p2, file$8, 72, 16, 2838);
    			attr_dev(div11, "class", "card-body");
    			add_location(div11, file$8, 67, 14, 2584);
    			attr_dev(div12, "class", "card h-100");
    			add_location(div12, file$8, 65, 12, 2406);
    			attr_dev(div13, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div13, file$8, 64, 10, 2356);
    			attr_dev(img3, "class", "card-img-top");
    			if (!src_url_equal(img3.src, img3_src_value = "../../resources/image/android.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$8, 84, 59, 3340);
    			attr_dev(a6, "href", "https://github.com/rodvkf72/Makers");
    			add_location(a6, file$8, 84, 14, 3295);
    			attr_dev(a7, "href", "https://github.com/rodvkf72/Makers");
    			add_location(a7, file$8, 87, 18, 3517);
    			attr_dev(h43, "class", "card-title");
    			add_location(h43, file$8, 86, 16, 3474);
    			add_location(h53, file$8, 89, 16, 3616);
    			attr_dev(p3, "class", "card-text");
    			add_location(p3, file$8, 90, 16, 3674);
    			attr_dev(div14, "class", "card-body");
    			add_location(div14, file$8, 85, 14, 3433);
    			attr_dev(div15, "class", "card h-100");
    			add_location(div15, file$8, 83, 12, 3255);
    			attr_dev(div16, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div16, file$8, 82, 10, 3205);
    			attr_dev(img4, "class", "card-img-top");
    			if (!src_url_equal(img4.src, img4_src_value = "../../resources/image/java.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$8, 102, 66, 4187);
    			attr_dev(a8, "href", "https://github.com/rodvkf72/WebMailSystem");
    			add_location(a8, file$8, 102, 14, 4135);
    			attr_dev(a9, "href", "https://github.com/rodvkf72/WebMailSystem");
    			add_location(a9, file$8, 105, 18, 4361);
    			attr_dev(h44, "class", "card-title");
    			add_location(h44, file$8, 104, 16, 4318);
    			add_location(h54, file$8, 107, 16, 4472);
    			attr_dev(p4, "class", "card-text");
    			add_location(p4, file$8, 108, 16, 4508);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file$8, 103, 14, 4277);
    			attr_dev(div18, "class", "card h-100");
    			add_location(div18, file$8, 101, 12, 4095);
    			attr_dev(div19, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div19, file$8, 100, 10, 4045);
    			attr_dev(img5, "class", "card-img-top");
    			if (!src_url_equal(img5.src, img5_src_value = "../../resources/image/android.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$8, 120, 26, 4956);
    			attr_dev(a10, "href", "#");
    			add_location(a10, file$8, 120, 14, 4944);
    			attr_dev(a11, "href", "#");
    			add_location(a11, file$8, 123, 18, 5133);
    			attr_dev(h45, "class", "card-title");
    			add_location(h45, file$8, 122, 16, 5090);
    			add_location(h55, file$8, 125, 16, 5205);
    			attr_dev(p5, "class", "card-text");
    			add_location(p5, file$8, 126, 16, 5264);
    			attr_dev(div20, "class", "card-body");
    			add_location(div20, file$8, 121, 14, 5049);
    			attr_dev(div21, "class", "card h-100");
    			add_location(div21, file$8, 119, 12, 4904);
    			attr_dev(div22, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div22, file$8, 118, 10, 4854);
    			attr_dev(img6, "class", "card-img-top");
    			if (!src_url_equal(img6.src, img6_src_value = "../../resources/image/android.jpg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			add_location(img6, file$8, 138, 78, 5764);
    			attr_dev(a12, "href", "https://github.com/rodvkf72/building_info_competition");
    			add_location(a12, file$8, 138, 14, 5700);
    			attr_dev(a13, "href", "https://github.com/rodvkf72/building_info_competition");
    			add_location(a13, file$8, 141, 18, 5941);
    			attr_dev(h46, "class", "card-title");
    			add_location(h46, file$8, 140, 16, 5898);
    			add_location(h56, file$8, 143, 16, 6073);
    			attr_dev(p6, "class", "card-text");
    			add_location(p6, file$8, 144, 16, 6132);
    			attr_dev(div23, "class", "card-body");
    			add_location(div23, file$8, 139, 14, 5857);
    			attr_dev(div24, "class", "card h-100");
    			add_location(div24, file$8, 137, 12, 5660);
    			attr_dev(div25, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div25, file$8, 136, 10, 5610);
    			attr_dev(img7, "class", "card-img-top");
    			if (!src_url_equal(img7.src, img7_src_value = "../../resources/image/ros.jpg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			add_location(img7, file$8, 156, 26, 6573);
    			attr_dev(a14, "href", "#");
    			add_location(a14, file$8, 156, 14, 6561);
    			attr_dev(a15, "href", "#");
    			add_location(a15, file$8, 159, 18, 6746);
    			attr_dev(h47, "class", "card-title");
    			add_location(h47, file$8, 158, 16, 6703);
    			add_location(h57, file$8, 161, 16, 6812);
    			attr_dev(p7, "class", "card-text");
    			add_location(p7, file$8, 162, 16, 6882);
    			attr_dev(div26, "class", "card-body");
    			add_location(div26, file$8, 157, 14, 6662);
    			attr_dev(div27, "class", "card h-100");
    			add_location(div27, file$8, 155, 12, 6521);
    			attr_dev(div28, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div28, file$8, 154, 10, 6471);
    			attr_dev(img8, "class", "card-img-top");
    			if (!src_url_equal(img8.src, img8_src_value = "../../resources/image/proc.jpg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$8, 174, 75, 7400);
    			attr_dev(a16, "href", "https://github.com/yongjjang/Service-Center-System");
    			add_location(a16, file$8, 174, 14, 7339);
    			attr_dev(a17, "href", "https://github.com/yongjjang/Service-Center-System");
    			add_location(a17, file$8, 177, 18, 7574);
    			attr_dev(h48, "class", "card-title");
    			add_location(h48, file$8, 176, 16, 7531);
    			add_location(h58, file$8, 179, 16, 7691);
    			attr_dev(p8, "class", "card-text");
    			add_location(p8, file$8, 180, 16, 7723);
    			attr_dev(div29, "class", "card-body");
    			add_location(div29, file$8, 175, 14, 7490);
    			attr_dev(div30, "class", "card h-100");
    			add_location(div30, file$8, 173, 12, 7299);
    			attr_dev(div31, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div31, file$8, 172, 10, 7249);
    			attr_dev(img9, "class", "card-img-top");
    			if (!src_url_equal(img9.src, img9_src_value = "../../resources/image/java.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "");
    			add_location(img9, file$8, 192, 26, 8216);
    			attr_dev(a18, "href", "#");
    			add_location(a18, file$8, 192, 14, 8204);
    			attr_dev(a19, "href", "#");
    			add_location(a19, file$8, 195, 18, 8390);
    			attr_dev(h49, "class", "card-title");
    			add_location(h49, file$8, 194, 16, 8347);
    			add_location(h59, file$8, 197, 16, 8456);
    			attr_dev(p9, "class", "card-text");
    			add_location(p9, file$8, 198, 16, 8487);
    			attr_dev(div32, "class", "card-body");
    			add_location(div32, file$8, 193, 14, 8306);
    			attr_dev(div33, "class", "card h-100");
    			add_location(div33, file$8, 191, 12, 8164);
    			attr_dev(div34, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div34, file$8, 190, 10, 8114);
    			attr_dev(img10, "class", "card-img-top");
    			if (!src_url_equal(img10.src, img10_src_value = "../../resources/image/html.jpg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "");
    			add_location(img10, file$8, 210, 26, 8983);
    			attr_dev(a20, "href", "#");
    			add_location(a20, file$8, 210, 14, 8971);
    			attr_dev(a21, "href", "#");
    			add_location(a21, file$8, 213, 18, 9157);
    			attr_dev(h410, "class", "card-title");
    			add_location(h410, file$8, 212, 16, 9114);
    			add_location(h510, file$8, 215, 16, 9226);
    			attr_dev(p10, "class", "card-text");
    			add_location(p10, file$8, 216, 16, 9279);
    			attr_dev(div35, "class", "card-body");
    			add_location(div35, file$8, 211, 14, 9073);
    			attr_dev(div36, "class", "card h-100");
    			add_location(div36, file$8, 209, 12, 8931);
    			attr_dev(div37, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div37, file$8, 208, 10, 8881);
    			attr_dev(img11, "class", "card-img-top");
    			if (!src_url_equal(img11.src, img11_src_value = "../../resources/image/vuforia.jpg")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "");
    			add_location(img11, file$8, 228, 26, 9750);
    			attr_dev(a22, "href", "#");
    			add_location(a22, file$8, 228, 14, 9738);
    			attr_dev(a23, "href", "#");
    			add_location(a23, file$8, 231, 18, 9927);
    			attr_dev(h411, "class", "card-title");
    			add_location(h411, file$8, 230, 16, 9884);
    			add_location(h511, file$8, 233, 16, 10003);
    			attr_dev(p11, "class", "card-text");
    			add_location(p11, file$8, 234, 16, 10043);
    			attr_dev(div38, "class", "card-body");
    			add_location(div38, file$8, 229, 14, 9843);
    			attr_dev(div39, "class", "card h-100");
    			add_location(div39, file$8, 227, 12, 9698);
    			attr_dev(div40, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div40, file$8, 226, 10, 9648);
    			attr_dev(img12, "class", "card-img-top");
    			if (!src_url_equal(img12.src, img12_src_value = "../../resources/image/java.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "");
    			add_location(img12, file$8, 246, 26, 10503);
    			attr_dev(a24, "href", "#");
    			add_location(a24, file$8, 246, 14, 10491);
    			attr_dev(a25, "href", "#");
    			add_location(a25, file$8, 249, 18, 10677);
    			attr_dev(h412, "class", "card-title");
    			add_location(h412, file$8, 248, 16, 10634);
    			add_location(h512, file$8, 251, 16, 10753);
    			attr_dev(p12, "class", "card-text");
    			add_location(p12, file$8, 252, 16, 10784);
    			attr_dev(div41, "class", "card-body");
    			add_location(div41, file$8, 247, 14, 10593);
    			attr_dev(div42, "class", "card h-100");
    			add_location(div42, file$8, 245, 12, 10451);
    			attr_dev(div43, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div43, file$8, 244, 10, 10401);
    			attr_dev(img13, "class", "card-img-top");
    			if (!src_url_equal(img13.src, img13_src_value = "../../resources/image/mfc.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "");
    			add_location(img13, file$8, 264, 26, 11264);
    			attr_dev(a26, "href", "#");
    			add_location(a26, file$8, 264, 14, 11252);
    			attr_dev(a27, "href", "#");
    			add_location(a27, file$8, 267, 18, 11437);
    			attr_dev(h413, "class", "card-title");
    			add_location(h413, file$8, 266, 16, 11394);
    			add_location(h513, file$8, 269, 16, 11504);
    			attr_dev(p13, "class", "card-text");
    			add_location(p13, file$8, 270, 16, 11534);
    			attr_dev(div44, "class", "card-body");
    			add_location(div44, file$8, 265, 14, 11353);
    			attr_dev(div45, "class", "card h-100");
    			add_location(div45, file$8, 263, 12, 11212);
    			attr_dev(div46, "class", "col-lg-4 col-md-6 mb-4");
    			add_location(div46, file$8, 262, 10, 11162);
    			attr_dev(div47, "class", "row");
    			add_location(div47, file$8, 26, 8, 605);
    			attr_dev(div48, "class", "col-lg-12");
    			add_location(div48, file$8, 22, 6, 566);
    			attr_dev(div49, "class", "row");
    			add_location(div49, file$8, 18, 4, 510);
    			attr_dev(div50, "class", "container");
    			add_location(div50, file$8, 16, 2, 479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div50, anchor);
    			append_dev(div50, div49);
    			append_dev(div49, div48);
    			append_dev(div48, div47);
    			append_dev(div47, div7);
    			append_dev(div7, div6);
    			append_dev(div6, a0);
    			append_dev(a0, img0);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, h40);
    			append_dev(h40, a1);
    			append_dev(div5, t8);
    			append_dev(div5, h50);
    			append_dev(div5, t10);
    			append_dev(div5, p0);
    			append_dev(div47, t12);
    			append_dev(div47, div10);
    			append_dev(div10, div9);
    			append_dev(div9, a2);
    			append_dev(a2, img1);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, h41);
    			append_dev(h41, a3);
    			append_dev(div8, t15);
    			append_dev(div8, h51);
    			append_dev(div8, t17);
    			append_dev(div8, p1);
    			append_dev(div47, t19);
    			append_dev(div47, div13);
    			append_dev(div13, div12);
    			append_dev(div12, a4);
    			append_dev(a4, img2);
    			append_dev(div12, t20);
    			append_dev(div12, div11);
    			append_dev(div11, h42);
    			append_dev(h42, a5);
    			append_dev(div11, t22);
    			append_dev(div11, h52);
    			append_dev(div11, t24);
    			append_dev(div11, p2);
    			append_dev(div47, t26);
    			append_dev(div47, div16);
    			append_dev(div16, div15);
    			append_dev(div15, a6);
    			append_dev(a6, img3);
    			append_dev(div15, t27);
    			append_dev(div15, div14);
    			append_dev(div14, h43);
    			append_dev(h43, a7);
    			append_dev(div14, t29);
    			append_dev(div14, h53);
    			append_dev(div14, t31);
    			append_dev(div14, p3);
    			append_dev(div47, t33);
    			append_dev(div47, div19);
    			append_dev(div19, div18);
    			append_dev(div18, a8);
    			append_dev(a8, img4);
    			append_dev(div18, t34);
    			append_dev(div18, div17);
    			append_dev(div17, h44);
    			append_dev(h44, a9);
    			append_dev(div17, t36);
    			append_dev(div17, h54);
    			append_dev(div17, t38);
    			append_dev(div17, p4);
    			append_dev(div47, t40);
    			append_dev(div47, div22);
    			append_dev(div22, div21);
    			append_dev(div21, a10);
    			append_dev(a10, img5);
    			append_dev(div21, t41);
    			append_dev(div21, div20);
    			append_dev(div20, h45);
    			append_dev(h45, a11);
    			append_dev(div20, t43);
    			append_dev(div20, h55);
    			append_dev(div20, t45);
    			append_dev(div20, p5);
    			append_dev(div47, t47);
    			append_dev(div47, div25);
    			append_dev(div25, div24);
    			append_dev(div24, a12);
    			append_dev(a12, img6);
    			append_dev(div24, t48);
    			append_dev(div24, div23);
    			append_dev(div23, h46);
    			append_dev(h46, a13);
    			append_dev(div23, t50);
    			append_dev(div23, h56);
    			append_dev(div23, t52);
    			append_dev(div23, p6);
    			append_dev(div47, t54);
    			append_dev(div47, div28);
    			append_dev(div28, div27);
    			append_dev(div27, a14);
    			append_dev(a14, img7);
    			append_dev(div27, t55);
    			append_dev(div27, div26);
    			append_dev(div26, h47);
    			append_dev(h47, a15);
    			append_dev(div26, t57);
    			append_dev(div26, h57);
    			append_dev(div26, t59);
    			append_dev(div26, p7);
    			append_dev(div47, t61);
    			append_dev(div47, div31);
    			append_dev(div31, div30);
    			append_dev(div30, a16);
    			append_dev(a16, img8);
    			append_dev(div30, t62);
    			append_dev(div30, div29);
    			append_dev(div29, h48);
    			append_dev(h48, a17);
    			append_dev(div29, t64);
    			append_dev(div29, h58);
    			append_dev(div29, t66);
    			append_dev(div29, p8);
    			append_dev(div47, t68);
    			append_dev(div47, div34);
    			append_dev(div34, div33);
    			append_dev(div33, a18);
    			append_dev(a18, img9);
    			append_dev(div33, t69);
    			append_dev(div33, div32);
    			append_dev(div32, h49);
    			append_dev(h49, a19);
    			append_dev(div32, t71);
    			append_dev(div32, h59);
    			append_dev(div32, t73);
    			append_dev(div32, p9);
    			append_dev(div47, t75);
    			append_dev(div47, div37);
    			append_dev(div37, div36);
    			append_dev(div36, a20);
    			append_dev(a20, img10);
    			append_dev(div36, t76);
    			append_dev(div36, div35);
    			append_dev(div35, h410);
    			append_dev(h410, a21);
    			append_dev(div35, t78);
    			append_dev(div35, h510);
    			append_dev(div35, t80);
    			append_dev(div35, p10);
    			append_dev(div47, t82);
    			append_dev(div47, div40);
    			append_dev(div40, div39);
    			append_dev(div39, a22);
    			append_dev(a22, img11);
    			append_dev(div39, t83);
    			append_dev(div39, div38);
    			append_dev(div38, h411);
    			append_dev(h411, a23);
    			append_dev(div38, t85);
    			append_dev(div38, h511);
    			append_dev(div38, t87);
    			append_dev(div38, p11);
    			append_dev(div47, t89);
    			append_dev(div47, div43);
    			append_dev(div43, div42);
    			append_dev(div42, a24);
    			append_dev(a24, img12);
    			append_dev(div42, t90);
    			append_dev(div42, div41);
    			append_dev(div41, h412);
    			append_dev(h412, a25);
    			append_dev(div41, t92);
    			append_dev(div41, h512);
    			append_dev(div41, t94);
    			append_dev(div41, p12);
    			append_dev(div47, t96);
    			append_dev(div47, div46);
    			append_dev(div46, div45);
    			append_dev(div45, a26);
    			append_dev(a26, img13);
    			append_dev(div45, t97);
    			append_dev(div45, div44);
    			append_dev(div44, h413);
    			append_dev(h413, a27);
    			append_dev(div44, t99);
    			append_dev(div44, h513);
    			append_dev(div44, t101);
    			append_dev(div44, p13);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div50);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Project', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\Java\noticeboard.svelte generated by Svelte v3.48.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src\\Java\\noticeboard.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (75:10) {#each resultList as item}
    function create_each_block$2(ctx) {
    	let div;
    	let a0;
    	let p0;
    	let t0_value = /*item*/ ctx[4].title + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let p1;
    	let t2;
    	let a1;
    	let t3_value = /*item*/ ctx[4].writer + "";
    	let t3;
    	let t4;
    	let t5_value = /*item*/ ctx[4].date + "";
    	let t5;
    	let t6;
    	let hr;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Posted by \r\n                    ");
    			a1 = element("a");
    			t3 = text(t3_value);
    			t4 = text("\r\n                    on ");
    			t5 = text(t5_value);
    			t6 = space();
    			hr = element("hr");
    			attr_dev(p0, "class", "post-title");
    			set_style(p0, "text-align", "center");
    			add_location(p0, file$7, 77, 20, 1893);
    			attr_dev(a0, "href", a0_href_value = "/noticeboard/view/" + /*item*/ ctx[4].no);
    			add_location(a0, file$7, 76, 16, 1833);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$7, 82, 20, 2125);
    			attr_dev(p1, "class", "post-meta");
    			set_style(p1, "text-align", "right");
    			add_location(p1, file$7, 81, 16, 2046);
    			attr_dev(div, "class", "post-preview");
    			add_location(div, file$7, 75, 12, 1789);
    			add_location(hr, file$7, 86, 12, 2246);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(p1, a1);
    			append_dev(a1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*resultList*/ 1 && a0_href_value !== (a0_href_value = "/noticeboard/view/" + /*item*/ ctx[4].no)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*resultList*/ 1 && t3_value !== (t3_value = /*item*/ ctx[4].writer + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*resultList*/ 1 && t5_value !== (t5_value = /*item*/ ctx[4].date + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(75:10) {#each resultList as item}",
    		ctx
    	});

    	return block;
    }

    // (109:12) {#if cnt <= max}
    function create_if_block$2(ctx) {
    	let input;
    	let t;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = text(" ");
    			attr_dev(input, "type", "button");
    			input.value = /*cnt*/ ctx[2];
    			attr_dev(input, "onclick", "location.href='/noticeboard/" + /*cnt*/ ctx[2] + "'");
    			add_location(input, file$7, 109, 16, 2931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(109:12) {#if cnt <= max}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br;
    	let t3;
    	let span;
    	let t5;
    	let div9;
    	let div8;
    	let div7;
    	let t6;
    	let div6;
    	let div5;
    	let each_value = /*resultList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block = /*cnt*/ ctx[2] <= /*max*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "게 시 판";
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			span = element("span");
    			span.textContent = "잡동사니 저장소";
    			t5 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div6 = element("div");
    			div5 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$7, 56, 4, 1270);
    			add_location(h1, file$7, 61, 12, 1453);
    			add_location(br, file$7, 62, 12, 1481);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$7, 63, 12, 1499);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$7, 60, 10, 1413);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$7, 59, 8, 1361);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$7, 58, 6, 1334);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$7, 57, 4, 1303);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/resources/image/home-bg.jpg')");
    			add_location(header, file$7, 55, 0, 1177);
    			attr_dev(div5, "id", "b_dv");
    			set_style(div5, "text-align", "center");
    			add_location(div5, file$7, 107, 10, 2841);
    			attr_dev(div6, "class", "clearfix");
    			add_location(div6, file$7, 106, 8, 2807);
    			attr_dev(div7, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div7, file$7, 73, 6, 1697);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$7, 72, 4, 1672);
    			attr_dev(div9, "class", "container");
    			add_location(div9, file$7, 71, 2, 1643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			if (if_block) if_block.m(div5, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resultList*/ 1) {
    				each_value = /*resultList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div7, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*cnt*/ ctx[2] <= /*max*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div5, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Noticeboard', slots, []);
    	let { page } = $$props;
    	let resultList = [];
    	let max;
    	let cnt = 1;

    	onMount(async () => {
    		let list = [];

    		let result = fetch('http://localhost:8080/noticeboard/' + page, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;
    			console.log(list);
    		});

    		await result;
    		$$invalidate(0, resultList = list.list);
    		$$invalidate(1, max = list.max[0].page);
    	});

    	const writable_props = ['page'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Noticeboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(3, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({ onMount, page, resultList, max, cnt });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(3, page = $$props.page);
    		if ('resultList' in $$props) $$invalidate(0, resultList = $$props.resultList);
    		if ('max' in $$props) $$invalidate(1, max = $$props.max);
    		if ('cnt' in $$props) $$invalidate(2, cnt = $$props.cnt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resultList, max, cnt, page];
    }

    class Noticeboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { page: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Noticeboard",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[3] === undefined && !('page' in props)) {
    			console_1$3.warn("<Noticeboard> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Noticeboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Noticeboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Java\noticeboardpost.svelte generated by Svelte v3.48.0 */

    const { console: console_1$2 } = globals;
    const file$6 = "src\\Java\\noticeboardpost.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (99:6) {:else}
    function create_else_block_1$1(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[5].nexttitle + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "http://localhost:4000/noticeboard/view/" + /*next*/ ctx[2]);
    			add_location(a, file$6, 99, 12, 2462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 1 && t_value !== (t_value = /*item*/ ctx[5].nexttitle + "")) set_data_dev(t, t_value);

    			if (dirty & /*next*/ 4 && a_href_value !== (a_href_value = "http://localhost:4000/noticeboard/view/" + /*next*/ ctx[2])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(99:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (97:6) {#if next == -1}
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("다음 글이 없습니다.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(97:6) {#if next == -1}",
    		ctx
    	});

    	return block;
    }

    // (108:10) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[5].prevtitle + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			set_style(a, "float", "right");
    			attr_dev(a, "href", a_href_value = "http://localhost:4000/noticeboard/view/" + /*prev*/ ctx[1]);
    			add_location(a, file$6, 108, 12, 2770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 1 && t_value !== (t_value = /*item*/ ctx[5].prevtitle + "")) set_data_dev(t, t_value);

    			if (dirty & /*prev*/ 2 && a_href_value !== (a_href_value = "http://localhost:4000/noticeboard/view/" + /*prev*/ ctx[1])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(108:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:10) {#if prev == -2}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("이전 글이 없습니다.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(106:10) {#if prev == -2}",
    		ctx
    	});

    	return block;
    }

    // (66:0) {#each resultList as item}
    function create_each_block$1(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t1_value = /*item*/ ctx[5].title + "";
    	let t1;
    	let t2;
    	let br0;
    	let t3;
    	let span0;
    	let t4;
    	let t5_value = /*item*/ ctx[5].writer + "";
    	let t5;
    	let t6;
    	let t7_value = /*item*/ ctx[5].date + "";
    	let t7;
    	let t8;
    	let article;
    	let div7;
    	let div6;
    	let div5;
    	let t9;
    	let hr0;
    	let t10;
    	let br1;
    	let t11;
    	let div8;
    	let span1;
    	let t12;
    	let div9;
    	let span2;
    	let t13;
    	let br2;
    	let t14;
    	let br3;
    	let t15;
    	let hr1;
    	let t16;
    	let br4;

    	function select_block_type(ctx, dirty) {
    		if (/*next*/ ctx[2] == -1) return create_if_block_1$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*prev*/ ctx[1] == -2) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			span0 = element("span");
    			t4 = text("Posted by ");
    			t5 = text(t5_value);
    			t6 = text(" on ");
    			t7 = text(t7_value);
    			t8 = space();
    			article = element("article");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			t9 = space();
    			hr0 = element("hr");
    			t10 = space();
    			br1 = element("br");
    			t11 = space();
    			div8 = element("div");
    			span1 = element("span");
    			if_block0.c();
    			t12 = space();
    			div9 = element("div");
    			span2 = element("span");
    			if_block1.c();
    			t13 = space();
    			br2 = element("br");
    			t14 = space();
    			br3 = element("br");
    			t15 = space();
    			hr1 = element("hr");
    			t16 = space();
    			br4 = element("br");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$6, 67, 4, 1559);
    			add_location(h1, file$6, 72, 12, 1742);
    			add_location(br0, file$6, 73, 12, 1779);
    			attr_dev(span0, "class", "meta");
    			add_location(span0, file$6, 75, 12, 1892);
    			attr_dev(div1, "class", "post-heading");
    			add_location(div1, file$6, 71, 10, 1702);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$6, 70, 8, 1650);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$6, 69, 6, 1623);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$6, 68, 4, 1592);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('img/post-bg.jpg')");
    			add_location(header, file$6, 66, 0, 1479);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div5, file$6, 86, 8, 2137);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$6, 85, 6, 2110);
    			add_location(hr0, file$6, 90, 6, 2250);
    			add_location(br1, file$6, 91, 6, 2262);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$6, 84, 4, 2079);
    			add_location(article, file$6, 83, 2, 2064);
    			set_style(span1, "float", "left");
    			add_location(span1, file$6, 95, 4, 2358);
    			set_style(div8, "float", "left");
    			set_style(div8, "width", "30%");
    			set_style(div8, "margin-left", "20%");
    			add_location(div8, file$6, 94, 2, 2296);
    			set_style(span2, "float", "right");
    			add_location(span2, file$6, 104, 6, 2657);
    			set_style(div9, "display", "inline-block");
    			set_style(div9, "width", "30%");
    			set_style(div9, "margin-right", "20%");
    			add_location(div9, file$6, 103, 2, 2582);
    			add_location(br2, file$6, 112, 0, 2912);
    			add_location(br3, file$6, 113, 0, 2918);
    			add_location(hr1, file$6, 114, 0, 2924);
    			add_location(br4, file$6, 115, 0, 2930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, br0);
    			append_dev(div1, t3);
    			append_dev(div1, span0);
    			append_dev(span0, t4);
    			append_dev(span0, t5);
    			append_dev(span0, t6);
    			append_dev(span0, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			div5.innerHTML = /*resultContent*/ ctx[3];
    			append_dev(div7, t9);
    			append_dev(div7, hr0);
    			append_dev(div7, t10);
    			append_dev(div7, br1);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, span1);
    			if_block0.m(span1, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, span2);
    			if_block1.m(span2, null);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, br4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 1 && t1_value !== (t1_value = /*item*/ ctx[5].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*resultList*/ 1 && t5_value !== (t5_value = /*item*/ ctx[5].writer + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*resultList*/ 1 && t7_value !== (t7_value = /*item*/ ctx[5].date + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*resultContent*/ 8) div5.innerHTML = /*resultContent*/ ctx[3];
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(span1, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(span2, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(article);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div8);
    			if_block0.d();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div9);
    			if_block1.d();
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(br4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(66:0) {#each resultList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let each_1_anchor;
    	let each_value = /*resultList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*prev, resultList, next, resultContent*/ 15) {
    				each_value = /*resultList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function reload() {
    	location.reload();
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Noticeboardpost', slots, []);
    	let { page } = $$props;
    	let resultList = [];
    	let prev;
    	let next;
    	let resultContent;

    	onMount(async () => {
    		let list = [];

    		let result = fetch('http://localhost:8080/noticeboard/view/' + page, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;
    			console.log(list);
    		});

    		await result;
    		$$invalidate(0, resultList = list.list);
    		$$invalidate(3, resultContent = resultList[0].content);
    		$$invalidate(1, prev = list.temp[0].prevtitle);
    		$$invalidate(2, next = list.temp[0].nexttitle);
    	});

    	const writable_props = ['page'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Noticeboardpost> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(4, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		page,
    		resultList,
    		prev,
    		next,
    		resultContent,
    		reload
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(4, page = $$props.page);
    		if ('resultList' in $$props) $$invalidate(0, resultList = $$props.resultList);
    		if ('prev' in $$props) $$invalidate(1, prev = $$props.prev);
    		if ('next' in $$props) $$invalidate(2, next = $$props.next);
    		if ('resultContent' in $$props) $$invalidate(3, resultContent = $$props.resultContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resultList, prev, next, resultContent, page];
    }

    class Noticeboardpost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { page: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Noticeboardpost",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[4] === undefined && !('page' in props)) {
    			console_1$2.warn("<Noticeboardpost> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<Noticeboardpost>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Noticeboardpost>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Java\managerhead.svelte generated by Svelte v3.48.0 */

    const file$5 = "src\\Java\\managerhead.svelte";

    function create_fragment$5(ctx) {
    	let meta0;
    	let meta1;
    	let meta2;
    	let meta3;
    	let script0;
    	let script0_src_value;
    	let link0;
    	let link1;
    	let link2;
    	let link3;
    	let link4;
    	let link5;
    	let link6;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let script3;
    	let script3_src_value;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			script0 = element("script");
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			link3 = element("link");
    			link4 = element("link");
    			link5 = element("link");
    			link6 = element("link");
    			script1 = element("script");
    			script2 = element("script");
    			script3 = element("script");
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$5, 2, 2, 19);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, shrink-to-fit=no");
    			add_location(meta1, file$5, 3, 2, 45);
    			attr_dev(meta2, "name", "description");
    			attr_dev(meta2, "content", "");
    			add_location(meta2, file$5, 4, 2, 135);
    			attr_dev(meta3, "name", "author");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file$5, 5, 2, 175);
    			if (!src_url_equal(script0.src, script0_src_value = "/Java/vendor/comming/jquery/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$5, 7, 2, 212);
    			attr_dev(link0, "href", "/Java/vendor/blog/bootstrap/css/bootstrap.min.css");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$5, 10, 2, 314);
    			attr_dev(link1, "href", "/Java/vendor/blog/fontawesome-free/css/all.min.css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file$5, 13, 2, 443);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic");
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			add_location(link2, file$5, 14, 2, 544);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800");
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			add_location(link3, file$5, 15, 2, 667);
    			attr_dev(link4, "href", "/Java/css/blog/clean-blog.min.css");
    			attr_dev(link4, "rel", "stylesheet");
    			add_location(link4, file$5, 18, 2, 883);
    			attr_dev(link5, "href", "/Java/css/blog/custom.css");
    			attr_dev(link5, "rel", "stylesheet");
    			add_location(link5, file$5, 19, 2, 951);
    			attr_dev(link6, "href", "https://cdn.quilljs.com/1.3.6/quill.snow.css");
    			attr_dev(link6, "rel", "stylesheet");
    			add_location(link6, file$5, 20, 2, 1011);
    			if (!src_url_equal(script1.src, script1_src_value = "/Java/vendor/comming/bootstrap/js/bootstrap.bundle.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$5, 23, 2, 1132);
    			if (!src_url_equal(script2.src, script2_src_value = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$5, 24, 2, 1217);
    			if (!src_url_equal(script3.src, script3_src_value = "https://cdn.quilljs.com/1.3.6/quill.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file$5, 25, 2, 1297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, meta3);
    			append_dev(document.head, script0);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, link3);
    			append_dev(document.head, link4);
    			append_dev(document.head, link5);
    			append_dev(document.head, link6);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			append_dev(document.head, script3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(script0);
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(link3);
    			detach_dev(link4);
    			detach_dev(link5);
    			detach_dev(link6);
    			detach_dev(script1);
    			detach_dev(script2);
    			detach_dev(script3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Managerhead', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Managerhead> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Managerhead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Managerhead",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Java\managernav.svelte generated by Svelte v3.48.0 */

    const file$4 = "src\\Java\\managernav.svelte";

    function create_fragment$4(ctx) {
    	let nav;
    	let div1;
    	let a0;
    	let t1;
    	let button;
    	let t2;
    	let i;
    	let t3;
    	let div0;
    	let ul;
    	let li0;
    	let a1;
    	let t5;
    	let li1;
    	let a2;
    	let t7;
    	let li2;
    	let a3;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Kim's Log - Manager";
    			t1 = space();
    			button = element("button");
    			t2 = text("Menu\r\n        ");
    			i = element("i");
    			t3 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t5 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "NoticeBoard";
    			t7 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Baekjoon";
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "/Manager/main");
    			add_location(a0, file$4, 2, 6, 141);
    			attr_dev(i, "class", "fas fa-bars");
    			add_location(i, file$4, 5, 8, 448);
    			attr_dev(button, "class", "navbar-toggler navbar-toggler-right");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarResponsive");
    			attr_dev(button, "aria-controls", "navbarResponsive");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$4, 3, 6, 217);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "/main");
    			add_location(a1, file$4, 10, 12, 648);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$4, 9, 10, 613);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "/Manager/noticeboard/list/1");
    			add_location(a2, file$4, 13, 12, 753);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$4, 12, 10, 718);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "/Manager/baekjoon/list/1");
    			add_location(a3, file$4, 16, 12, 887);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file$4, 15, 10, 852);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file$4, 8, 8, 570);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarResponsive");
    			add_location(div0, file$4, 7, 6, 500);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$4, 1, 4, 110);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light fixed-top");
    			attr_dev(nav, "id", "mainNav");
    			attr_dev(nav, "sytle", "background-color:black");
    			add_location(nav, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, t2);
    			append_dev(button, i);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Managernav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Managernav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Managernav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Managernav",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Java\managermain.svelte generated by Svelte v3.48.0 */

    const file$3 = "src\\Java\\managermain.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br;
    	let t3;
    	let span;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Kim's Log";
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			span = element("span");
    			span.textContent = "관리자 페이지 - main";
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$3, 1, 4, 88);
    			add_location(h1, file$3, 6, 18, 289);
    			add_location(br, file$3, 7, 18, 327);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$3, 8, 18, 351);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$3, 5, 16, 243);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$3, 4, 12, 185);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$3, 3, 8, 154);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$3, 2, 4, 121);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Managermain', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Managermain> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Managermain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Managermain",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Java\managerlist.svelte generated by Svelte v3.48.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\Java\\managerlist.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (57:10) {#each resultList as item}
    function create_each_block(ctx) {
    	let div;
    	let a0;
    	let p0;
    	let t0_value = /*item*/ ctx[7].title + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let p1;
    	let t2;
    	let a1;
    	let t3_value = /*item*/ ctx[7].writer + "";
    	let t3;
    	let t4;
    	let t5_value = /*item*/ ctx[7].date + "";
    	let t5;
    	let t6;
    	let hr;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Posted by \r\n                    ");
    			a1 = element("a");
    			t3 = text(t3_value);
    			t4 = text("\r\n                    on ");
    			t5 = text(t5_value);
    			t6 = space();
    			hr = element("hr");
    			attr_dev(p0, "class", "post-title");
    			set_style(p0, "text-align", "center");
    			set_style(p0, "font-size", "30px");
    			add_location(p0, file$2, 59, 20, 1650);
    			attr_dev(a0, "href", a0_href_value = "/Manager/" + /*division*/ ctx[0] + "/update/" + /*item*/ ctx[7].no);
    			add_location(a0, file$2, 58, 16, 1581);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$2, 64, 20, 1900);
    			attr_dev(p1, "class", "post-meta");
    			set_style(p1, "text-align", "right");
    			add_location(p1, file$2, 63, 16, 1821);
    			attr_dev(div, "class", "post-preview");
    			add_location(div, file$2, 57, 12, 1537);
    			add_location(hr, file$2, 68, 12, 2021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(p1, a1);
    			append_dev(a1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultList*/ 2 && t0_value !== (t0_value = /*item*/ ctx[7].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*division, resultList*/ 3 && a0_href_value !== (a0_href_value = "/Manager/" + /*division*/ ctx[0] + "/update/" + /*item*/ ctx[7].no)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*resultList*/ 2 && t3_value !== (t3_value = /*item*/ ctx[7].writer + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*resultList*/ 2 && t5_value !== (t5_value = /*item*/ ctx[7].date + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:10) {#each resultList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br;
    	let t3;
    	let span;
    	let t4;
    	let t5;
    	let t6;
    	let div7;
    	let div6;
    	let div5;
    	let each_value = /*resultList*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Kim's Log";
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			span = element("span");
    			t4 = text("관리자 페이지 - ");
    			t5 = text(/*division*/ ctx[0]);
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$2, 38, 4, 965);
    			add_location(h1, file$2, 43, 18, 1166);
    			add_location(br, file$2, 44, 18, 1204);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$2, 45, 18, 1228);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$2, 42, 16, 1120);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$2, 41, 12, 1062);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$2, 40, 8, 1031);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$2, 39, 4, 998);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$2, 37, 0, 877);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div5, file$2, 55, 6, 1445);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$2, 54, 4, 1420);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$2, 53, 0, 1391);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*division*/ 1) set_data_dev(t5, /*division*/ ctx[0]);

    			if (dirty & /*resultList, division*/ 3) {
    				each_value = /*resultList*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Managerlist', slots, []);
    	let resultList = [];
    	let prev;
    	let next;
    	let resultContent;
    	let { division } = $$props;
    	let { page } = $$props;
    	let test = [];

    	onMount(async () => {
    		var test = document.location.href.split("/");
    		$$invalidate(0, division = test[4]);
    		let list = [];

    		let result = fetch('http://localhost:8080/Manager/' + test[4] + '/list/' + page, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;
    			console.log(list);
    		});

    		await result;
    		$$invalidate(1, resultList = list.list);
    		resultContent = resultList[0].content;
    	});

    	const writable_props = ['division', 'page'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Managerlist> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('division' in $$props) $$invalidate(0, division = $$props.division);
    		if ('page' in $$props) $$invalidate(2, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		resultList,
    		prev,
    		next,
    		resultContent,
    		division,
    		page,
    		test
    	});

    	$$self.$inject_state = $$props => {
    		if ('resultList' in $$props) $$invalidate(1, resultList = $$props.resultList);
    		if ('prev' in $$props) prev = $$props.prev;
    		if ('next' in $$props) next = $$props.next;
    		if ('resultContent' in $$props) resultContent = $$props.resultContent;
    		if ('division' in $$props) $$invalidate(0, division = $$props.division);
    		if ('page' in $$props) $$invalidate(2, page = $$props.page);
    		if ('test' in $$props) test = $$props.test;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [division, resultList, page];
    }

    class Managerlist extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { division: 0, page: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Managerlist",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*division*/ ctx[0] === undefined && !('division' in props)) {
    			console_1$1.warn("<Managerlist> was created without expected prop 'division'");
    		}

    		if (/*page*/ ctx[2] === undefined && !('page' in props)) {
    			console_1$1.warn("<Managerlist> was created without expected prop 'page'");
    		}
    	}

    	get division() {
    		throw new Error("<Managerlist>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set division(value) {
    		throw new Error("<Managerlist>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<Managerlist>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Managerlist>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var index_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	factory(exports) ;
    }(commonjsGlobal, (function (exports) {
    	var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};

    	function unwrapExports (x) {
    		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    	}

    	function createCommonjsModule(fn, module) {
    		return module = { exports: {} }, fn(module, module.exports), module.exports;
    	}

    	var quill = createCommonjsModule(function (module, exports) {
    	/*!
    	 * Quill Editor v1.3.7
    	 * https://quilljs.com/
    	 * Copyright (c) 2014, Jason Chen
    	 * Copyright (c) 2013, salesforce.com
    	 */
    	(function webpackUniversalModuleDefinition(root, factory) {
    		module.exports = factory();
    	})(typeof self !== 'undefined' ? self : commonjsGlobal$1, function() {
    	return /******/ (function(modules) { // webpackBootstrap
    	/******/ 	// The module cache
    	/******/ 	var installedModules = {};
    	/******/
    	/******/ 	// The require function
    	/******/ 	function __webpack_require__(moduleId) {
    	/******/
    	/******/ 		// Check if module is in cache
    	/******/ 		if(installedModules[moduleId]) {
    	/******/ 			return installedModules[moduleId].exports;
    	/******/ 		}
    	/******/ 		// Create a new module (and put it into the cache)
    	/******/ 		var module = installedModules[moduleId] = {
    	/******/ 			i: moduleId,
    	/******/ 			l: false,
    	/******/ 			exports: {}
    	/******/ 		};
    	/******/
    	/******/ 		// Execute the module function
    	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    	/******/
    	/******/ 		// Flag the module as loaded
    	/******/ 		module.l = true;
    	/******/
    	/******/ 		// Return the exports of the module
    	/******/ 		return module.exports;
    	/******/ 	}
    	/******/
    	/******/
    	/******/ 	// expose the modules object (__webpack_modules__)
    	/******/ 	__webpack_require__.m = modules;
    	/******/
    	/******/ 	// expose the module cache
    	/******/ 	__webpack_require__.c = installedModules;
    	/******/
    	/******/ 	// define getter function for harmony exports
    	/******/ 	__webpack_require__.d = function(exports, name, getter) {
    	/******/ 		if(!__webpack_require__.o(exports, name)) {
    	/******/ 			Object.defineProperty(exports, name, {
    	/******/ 				configurable: false,
    	/******/ 				enumerable: true,
    	/******/ 				get: getter
    	/******/ 			});
    	/******/ 		}
    	/******/ 	};
    	/******/
    	/******/ 	// getDefaultExport function for compatibility with non-harmony modules
    	/******/ 	__webpack_require__.n = function(module) {
    	/******/ 		var getter = module && module.__esModule ?
    	/******/ 			function getDefault() { return module['default']; } :
    	/******/ 			function getModuleExports() { return module; };
    	/******/ 		__webpack_require__.d(getter, 'a', getter);
    	/******/ 		return getter;
    	/******/ 	};
    	/******/
    	/******/ 	// Object.prototype.hasOwnProperty.call
    	/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    	/******/
    	/******/ 	// __webpack_public_path__
    	/******/ 	__webpack_require__.p = "";
    	/******/
    	/******/ 	// Load entry module and return exports
    	/******/ 	return __webpack_require__(__webpack_require__.s = 109);
    	/******/ })
    	/************************************************************************/
    	/******/ ([
    	/* 0 */
    	/***/ (function(module, exports, __webpack_require__) {

    	Object.defineProperty(exports, "__esModule", { value: true });
    	var container_1 = __webpack_require__(17);
    	var format_1 = __webpack_require__(18);
    	var leaf_1 = __webpack_require__(19);
    	var scroll_1 = __webpack_require__(45);
    	var inline_1 = __webpack_require__(46);
    	var block_1 = __webpack_require__(47);
    	var embed_1 = __webpack_require__(48);
    	var text_1 = __webpack_require__(49);
    	var attributor_1 = __webpack_require__(12);
    	var class_1 = __webpack_require__(32);
    	var style_1 = __webpack_require__(33);
    	var store_1 = __webpack_require__(31);
    	var Registry = __webpack_require__(1);
    	var Parchment = {
    	    Scope: Registry.Scope,
    	    create: Registry.create,
    	    find: Registry.find,
    	    query: Registry.query,
    	    register: Registry.register,
    	    Container: container_1.default,
    	    Format: format_1.default,
    	    Leaf: leaf_1.default,
    	    Embed: embed_1.default,
    	    Scroll: scroll_1.default,
    	    Block: block_1.default,
    	    Inline: inline_1.default,
    	    Text: text_1.default,
    	    Attributor: {
    	        Attribute: attributor_1.default,
    	        Class: class_1.default,
    	        Style: style_1.default,
    	        Store: store_1.default,
    	    },
    	};
    	exports.default = Parchment;


    	/***/ }),
    	/* 1 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var ParchmentError = /** @class */ (function (_super) {
    	    __extends(ParchmentError, _super);
    	    function ParchmentError(message) {
    	        var _this = this;
    	        message = '[Parchment] ' + message;
    	        _this = _super.call(this, message) || this;
    	        _this.message = message;
    	        _this.name = _this.constructor.name;
    	        return _this;
    	    }
    	    return ParchmentError;
    	}(Error));
    	exports.ParchmentError = ParchmentError;
    	var attributes = {};
    	var classes = {};
    	var tags = {};
    	var types = {};
    	exports.DATA_KEY = '__blot';
    	var Scope;
    	(function (Scope) {
    	    Scope[Scope["TYPE"] = 3] = "TYPE";
    	    Scope[Scope["LEVEL"] = 12] = "LEVEL";
    	    Scope[Scope["ATTRIBUTE"] = 13] = "ATTRIBUTE";
    	    Scope[Scope["BLOT"] = 14] = "BLOT";
    	    Scope[Scope["INLINE"] = 7] = "INLINE";
    	    Scope[Scope["BLOCK"] = 11] = "BLOCK";
    	    Scope[Scope["BLOCK_BLOT"] = 10] = "BLOCK_BLOT";
    	    Scope[Scope["INLINE_BLOT"] = 6] = "INLINE_BLOT";
    	    Scope[Scope["BLOCK_ATTRIBUTE"] = 9] = "BLOCK_ATTRIBUTE";
    	    Scope[Scope["INLINE_ATTRIBUTE"] = 5] = "INLINE_ATTRIBUTE";
    	    Scope[Scope["ANY"] = 15] = "ANY";
    	})(Scope = exports.Scope || (exports.Scope = {}));
    	function create(input, value) {
    	    var match = query(input);
    	    if (match == null) {
    	        throw new ParchmentError("Unable to create " + input + " blot");
    	    }
    	    var BlotClass = match;
    	    var node = 
    	    // @ts-ignore
    	    input instanceof Node || input['nodeType'] === Node.TEXT_NODE ? input : BlotClass.create(value);
    	    return new BlotClass(node, value);
    	}
    	exports.create = create;
    	function find(node, bubble) {
    	    if (bubble === void 0) { bubble = false; }
    	    if (node == null)
    	        return null;
    	    // @ts-ignore
    	    if (node[exports.DATA_KEY] != null)
    	        return node[exports.DATA_KEY].blot;
    	    if (bubble)
    	        return find(node.parentNode, bubble);
    	    return null;
    	}
    	exports.find = find;
    	function query(query, scope) {
    	    if (scope === void 0) { scope = Scope.ANY; }
    	    var match;
    	    if (typeof query === 'string') {
    	        match = types[query] || attributes[query];
    	        // @ts-ignore
    	    }
    	    else if (query instanceof Text || query['nodeType'] === Node.TEXT_NODE) {
    	        match = types['text'];
    	    }
    	    else if (typeof query === 'number') {
    	        if (query & Scope.LEVEL & Scope.BLOCK) {
    	            match = types['block'];
    	        }
    	        else if (query & Scope.LEVEL & Scope.INLINE) {
    	            match = types['inline'];
    	        }
    	    }
    	    else if (query instanceof HTMLElement) {
    	        var names = (query.getAttribute('class') || '').split(/\s+/);
    	        for (var i in names) {
    	            match = classes[names[i]];
    	            if (match)
    	                break;
    	        }
    	        match = match || tags[query.tagName];
    	    }
    	    if (match == null)
    	        return null;
    	    // @ts-ignore
    	    if (scope & Scope.LEVEL & match.scope && scope & Scope.TYPE & match.scope)
    	        return match;
    	    return null;
    	}
    	exports.query = query;
    	function register() {
    	    var Definitions = [];
    	    for (var _i = 0; _i < arguments.length; _i++) {
    	        Definitions[_i] = arguments[_i];
    	    }
    	    if (Definitions.length > 1) {
    	        return Definitions.map(function (d) {
    	            return register(d);
    	        });
    	    }
    	    var Definition = Definitions[0];
    	    if (typeof Definition.blotName !== 'string' && typeof Definition.attrName !== 'string') {
    	        throw new ParchmentError('Invalid definition');
    	    }
    	    else if (Definition.blotName === 'abstract') {
    	        throw new ParchmentError('Cannot register abstract class');
    	    }
    	    types[Definition.blotName || Definition.attrName] = Definition;
    	    if (typeof Definition.keyName === 'string') {
    	        attributes[Definition.keyName] = Definition;
    	    }
    	    else {
    	        if (Definition.className != null) {
    	            classes[Definition.className] = Definition;
    	        }
    	        if (Definition.tagName != null) {
    	            if (Array.isArray(Definition.tagName)) {
    	                Definition.tagName = Definition.tagName.map(function (tagName) {
    	                    return tagName.toUpperCase();
    	                });
    	            }
    	            else {
    	                Definition.tagName = Definition.tagName.toUpperCase();
    	            }
    	            var tagNames = Array.isArray(Definition.tagName) ? Definition.tagName : [Definition.tagName];
    	            tagNames.forEach(function (tag) {
    	                if (tags[tag] == null || Definition.className == null) {
    	                    tags[tag] = Definition;
    	                }
    	            });
    	        }
    	    }
    	    return Definition;
    	}
    	exports.register = register;


    	/***/ }),
    	/* 2 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var diff = __webpack_require__(51);
    	var equal = __webpack_require__(11);
    	var extend = __webpack_require__(3);
    	var op = __webpack_require__(20);


    	var NULL_CHARACTER = String.fromCharCode(0);  // Placeholder char for embed in diff()


    	var Delta = function (ops) {
    	  // Assume we are given a well formed ops
    	  if (Array.isArray(ops)) {
    	    this.ops = ops;
    	  } else if (ops != null && Array.isArray(ops.ops)) {
    	    this.ops = ops.ops;
    	  } else {
    	    this.ops = [];
    	  }
    	};


    	Delta.prototype.insert = function (text, attributes) {
    	  var newOp = {};
    	  if (text.length === 0) return this;
    	  newOp.insert = text;
    	  if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
    	    newOp.attributes = attributes;
    	  }
    	  return this.push(newOp);
    	};

    	Delta.prototype['delete'] = function (length) {
    	  if (length <= 0) return this;
    	  return this.push({ 'delete': length });
    	};

    	Delta.prototype.retain = function (length, attributes) {
    	  if (length <= 0) return this;
    	  var newOp = { retain: length };
    	  if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
    	    newOp.attributes = attributes;
    	  }
    	  return this.push(newOp);
    	};

    	Delta.prototype.push = function (newOp) {
    	  var index = this.ops.length;
    	  var lastOp = this.ops[index - 1];
    	  newOp = extend(true, {}, newOp);
    	  if (typeof lastOp === 'object') {
    	    if (typeof newOp['delete'] === 'number' && typeof lastOp['delete'] === 'number') {
    	      this.ops[index - 1] = { 'delete': lastOp['delete'] + newOp['delete'] };
    	      return this;
    	    }
    	    // Since it does not matter if we insert before or after deleting at the same index,
    	    // always prefer to insert first
    	    if (typeof lastOp['delete'] === 'number' && newOp.insert != null) {
    	      index -= 1;
    	      lastOp = this.ops[index - 1];
    	      if (typeof lastOp !== 'object') {
    	        this.ops.unshift(newOp);
    	        return this;
    	      }
    	    }
    	    if (equal(newOp.attributes, lastOp.attributes)) {
    	      if (typeof newOp.insert === 'string' && typeof lastOp.insert === 'string') {
    	        this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
    	        if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
    	        return this;
    	      } else if (typeof newOp.retain === 'number' && typeof lastOp.retain === 'number') {
    	        this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
    	        if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
    	        return this;
    	      }
    	    }
    	  }
    	  if (index === this.ops.length) {
    	    this.ops.push(newOp);
    	  } else {
    	    this.ops.splice(index, 0, newOp);
    	  }
    	  return this;
    	};

    	Delta.prototype.chop = function () {
    	  var lastOp = this.ops[this.ops.length - 1];
    	  if (lastOp && lastOp.retain && !lastOp.attributes) {
    	    this.ops.pop();
    	  }
    	  return this;
    	};

    	Delta.prototype.filter = function (predicate) {
    	  return this.ops.filter(predicate);
    	};

    	Delta.prototype.forEach = function (predicate) {
    	  this.ops.forEach(predicate);
    	};

    	Delta.prototype.map = function (predicate) {
    	  return this.ops.map(predicate);
    	};

    	Delta.prototype.partition = function (predicate) {
    	  var passed = [], failed = [];
    	  this.forEach(function(op) {
    	    var target = predicate(op) ? passed : failed;
    	    target.push(op);
    	  });
    	  return [passed, failed];
    	};

    	Delta.prototype.reduce = function (predicate, initial) {
    	  return this.ops.reduce(predicate, initial);
    	};

    	Delta.prototype.changeLength = function () {
    	  return this.reduce(function (length, elem) {
    	    if (elem.insert) {
    	      return length + op.length(elem);
    	    } else if (elem.delete) {
    	      return length - elem.delete;
    	    }
    	    return length;
    	  }, 0);
    	};

    	Delta.prototype.length = function () {
    	  return this.reduce(function (length, elem) {
    	    return length + op.length(elem);
    	  }, 0);
    	};

    	Delta.prototype.slice = function (start, end) {
    	  start = start || 0;
    	  if (typeof end !== 'number') end = Infinity;
    	  var ops = [];
    	  var iter = op.iterator(this.ops);
    	  var index = 0;
    	  while (index < end && iter.hasNext()) {
    	    var nextOp;
    	    if (index < start) {
    	      nextOp = iter.next(start - index);
    	    } else {
    	      nextOp = iter.next(end - index);
    	      ops.push(nextOp);
    	    }
    	    index += op.length(nextOp);
    	  }
    	  return new Delta(ops);
    	};


    	Delta.prototype.compose = function (other) {
    	  var thisIter = op.iterator(this.ops);
    	  var otherIter = op.iterator(other.ops);
    	  var ops = [];
    	  var firstOther = otherIter.peek();
    	  if (firstOther != null && typeof firstOther.retain === 'number' && firstOther.attributes == null) {
    	    var firstLeft = firstOther.retain;
    	    while (thisIter.peekType() === 'insert' && thisIter.peekLength() <= firstLeft) {
    	      firstLeft -= thisIter.peekLength();
    	      ops.push(thisIter.next());
    	    }
    	    if (firstOther.retain - firstLeft > 0) {
    	      otherIter.next(firstOther.retain - firstLeft);
    	    }
    	  }
    	  var delta = new Delta(ops);
    	  while (thisIter.hasNext() || otherIter.hasNext()) {
    	    if (otherIter.peekType() === 'insert') {
    	      delta.push(otherIter.next());
    	    } else if (thisIter.peekType() === 'delete') {
    	      delta.push(thisIter.next());
    	    } else {
    	      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
    	      var thisOp = thisIter.next(length);
    	      var otherOp = otherIter.next(length);
    	      if (typeof otherOp.retain === 'number') {
    	        var newOp = {};
    	        if (typeof thisOp.retain === 'number') {
    	          newOp.retain = length;
    	        } else {
    	          newOp.insert = thisOp.insert;
    	        }
    	        // Preserve null when composing with a retain, otherwise remove it for inserts
    	        var attributes = op.attributes.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === 'number');
    	        if (attributes) newOp.attributes = attributes;
    	        delta.push(newOp);

    	        // Optimization if rest of other is just retain
    	        if (!otherIter.hasNext() && equal(delta.ops[delta.ops.length - 1], newOp)) {
    	          var rest = new Delta(thisIter.rest());
    	          return delta.concat(rest).chop();
    	        }

    	      // Other op should be delete, we could be an insert or retain
    	      // Insert + delete cancels out
    	      } else if (typeof otherOp['delete'] === 'number' && typeof thisOp.retain === 'number') {
    	        delta.push(otherOp);
    	      }
    	    }
    	  }
    	  return delta.chop();
    	};

    	Delta.prototype.concat = function (other) {
    	  var delta = new Delta(this.ops.slice());
    	  if (other.ops.length > 0) {
    	    delta.push(other.ops[0]);
    	    delta.ops = delta.ops.concat(other.ops.slice(1));
    	  }
    	  return delta;
    	};

    	Delta.prototype.diff = function (other, index) {
    	  if (this.ops === other.ops) {
    	    return new Delta();
    	  }
    	  var strings = [this, other].map(function (delta) {
    	    return delta.map(function (op) {
    	      if (op.insert != null) {
    	        return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
    	      }
    	      var prep = (delta === other) ? 'on' : 'with';
    	      throw new Error('diff() called ' + prep + ' non-document');
    	    }).join('');
    	  });
    	  var delta = new Delta();
    	  var diffResult = diff(strings[0], strings[1], index);
    	  var thisIter = op.iterator(this.ops);
    	  var otherIter = op.iterator(other.ops);
    	  diffResult.forEach(function (component) {
    	    var length = component[1].length;
    	    while (length > 0) {
    	      var opLength = 0;
    	      switch (component[0]) {
    	        case diff.INSERT:
    	          opLength = Math.min(otherIter.peekLength(), length);
    	          delta.push(otherIter.next(opLength));
    	          break;
    	        case diff.DELETE:
    	          opLength = Math.min(length, thisIter.peekLength());
    	          thisIter.next(opLength);
    	          delta['delete'](opLength);
    	          break;
    	        case diff.EQUAL:
    	          opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
    	          var thisOp = thisIter.next(opLength);
    	          var otherOp = otherIter.next(opLength);
    	          if (equal(thisOp.insert, otherOp.insert)) {
    	            delta.retain(opLength, op.attributes.diff(thisOp.attributes, otherOp.attributes));
    	          } else {
    	            delta.push(otherOp)['delete'](opLength);
    	          }
    	          break;
    	      }
    	      length -= opLength;
    	    }
    	  });
    	  return delta.chop();
    	};

    	Delta.prototype.eachLine = function (predicate, newline) {
    	  newline = newline || '\n';
    	  var iter = op.iterator(this.ops);
    	  var line = new Delta();
    	  var i = 0;
    	  while (iter.hasNext()) {
    	    if (iter.peekType() !== 'insert') return;
    	    var thisOp = iter.peek();
    	    var start = op.length(thisOp) - iter.peekLength();
    	    var index = typeof thisOp.insert === 'string' ?
    	      thisOp.insert.indexOf(newline, start) - start : -1;
    	    if (index < 0) {
    	      line.push(iter.next());
    	    } else if (index > 0) {
    	      line.push(iter.next(index));
    	    } else {
    	      if (predicate(line, iter.next(1).attributes || {}, i) === false) {
    	        return;
    	      }
    	      i += 1;
    	      line = new Delta();
    	    }
    	  }
    	  if (line.length() > 0) {
    	    predicate(line, {}, i);
    	  }
    	};

    	Delta.prototype.transform = function (other, priority) {
    	  priority = !!priority;
    	  if (typeof other === 'number') {
    	    return this.transformPosition(other, priority);
    	  }
    	  var thisIter = op.iterator(this.ops);
    	  var otherIter = op.iterator(other.ops);
    	  var delta = new Delta();
    	  while (thisIter.hasNext() || otherIter.hasNext()) {
    	    if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
    	      delta.retain(op.length(thisIter.next()));
    	    } else if (otherIter.peekType() === 'insert') {
    	      delta.push(otherIter.next());
    	    } else {
    	      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
    	      var thisOp = thisIter.next(length);
    	      var otherOp = otherIter.next(length);
    	      if (thisOp['delete']) {
    	        // Our delete either makes their delete redundant or removes their retain
    	        continue;
    	      } else if (otherOp['delete']) {
    	        delta.push(otherOp);
    	      } else {
    	        // We retain either their retain or insert
    	        delta.retain(length, op.attributes.transform(thisOp.attributes, otherOp.attributes, priority));
    	      }
    	    }
    	  }
    	  return delta.chop();
    	};

    	Delta.prototype.transformPosition = function (index, priority) {
    	  priority = !!priority;
    	  var thisIter = op.iterator(this.ops);
    	  var offset = 0;
    	  while (thisIter.hasNext() && offset <= index) {
    	    var length = thisIter.peekLength();
    	    var nextType = thisIter.peekType();
    	    thisIter.next();
    	    if (nextType === 'delete') {
    	      index -= Math.min(length, index - offset);
    	      continue;
    	    } else if (nextType === 'insert' && (offset < index || !priority)) {
    	      index += length;
    	    }
    	    offset += length;
    	  }
    	  return index;
    	};


    	module.exports = Delta;


    	/***/ }),
    	/* 3 */
    	/***/ (function(module, exports) {

    	var hasOwn = Object.prototype.hasOwnProperty;
    	var toStr = Object.prototype.toString;
    	var defineProperty = Object.defineProperty;
    	var gOPD = Object.getOwnPropertyDescriptor;

    	var isArray = function isArray(arr) {
    		if (typeof Array.isArray === 'function') {
    			return Array.isArray(arr);
    		}

    		return toStr.call(arr) === '[object Array]';
    	};

    	var isPlainObject = function isPlainObject(obj) {
    		if (!obj || toStr.call(obj) !== '[object Object]') {
    			return false;
    		}

    		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    		// Not own constructor property must be Object
    		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    			return false;
    		}

    		// Own properties are enumerated firstly, so to speed up,
    		// if last one is own, then all properties are own.
    		var key;
    		for (key in obj) { /**/ }

    		return typeof key === 'undefined' || hasOwn.call(obj, key);
    	};

    	// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
    	var setProperty = function setProperty(target, options) {
    		if (defineProperty && options.name === '__proto__') {
    			defineProperty(target, options.name, {
    				enumerable: true,
    				configurable: true,
    				value: options.newValue,
    				writable: true
    			});
    		} else {
    			target[options.name] = options.newValue;
    		}
    	};

    	// Return undefined instead of __proto__ if '__proto__' is not an own property
    	var getProperty = function getProperty(obj, name) {
    		if (name === '__proto__') {
    			if (!hasOwn.call(obj, name)) {
    				return void 0;
    			} else if (gOPD) {
    				// In early versions of node, obj['__proto__'] is buggy when obj has
    				// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
    				return gOPD(obj, name).value;
    			}
    		}

    		return obj[name];
    	};

    	module.exports = function extend() {
    		var options, name, src, copy, copyIsArray, clone;
    		var target = arguments[0];
    		var i = 1;
    		var length = arguments.length;
    		var deep = false;

    		// Handle a deep copy situation
    		if (typeof target === 'boolean') {
    			deep = target;
    			target = arguments[1] || {};
    			// skip the boolean and the target
    			i = 2;
    		}
    		if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
    			target = {};
    		}

    		for (; i < length; ++i) {
    			options = arguments[i];
    			// Only deal with non-null/undefined values
    			if (options != null) {
    				// Extend the base object
    				for (name in options) {
    					src = getProperty(target, name);
    					copy = getProperty(options, name);

    					// Prevent never-ending loop
    					if (target !== copy) {
    						// Recurse if we're merging plain objects or arrays
    						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
    							if (copyIsArray) {
    								copyIsArray = false;
    								clone = src && isArray(src) ? src : [];
    							} else {
    								clone = src && isPlainObject(src) ? src : {};
    							}

    							// Never move original objects, clone them
    							setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

    						// Don't bring in undefined values
    						} else if (typeof copy !== 'undefined') {
    							setProperty(target, { name: name, newValue: copy });
    						}
    					}
    				}
    			}
    		}

    		// Return the modified object
    		return target;
    	};


    	/***/ }),
    	/* 4 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.BlockEmbed = exports.bubbleFormats = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _break = __webpack_require__(16);

    	var _break2 = _interopRequireDefault(_break);

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	var _text = __webpack_require__(7);

    	var _text2 = _interopRequireDefault(_text);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var NEWLINE_LENGTH = 1;

    	var BlockEmbed = function (_Parchment$Embed) {
    	  _inherits(BlockEmbed, _Parchment$Embed);

    	  function BlockEmbed() {
    	    _classCallCheck(this, BlockEmbed);

    	    return _possibleConstructorReturn(this, (BlockEmbed.__proto__ || Object.getPrototypeOf(BlockEmbed)).apply(this, arguments));
    	  }

    	  _createClass(BlockEmbed, [{
    	    key: 'attach',
    	    value: function attach() {
    	      _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'attach', this).call(this);
    	      this.attributes = new _parchment2.default.Attributor.Store(this.domNode);
    	    }
    	  }, {
    	    key: 'delta',
    	    value: function delta() {
    	      return new _quillDelta2.default().insert(this.value(), (0, _extend2.default)(this.formats(), this.attributes.values()));
    	    }
    	  }, {
    	    key: 'format',
    	    value: function format(name, value) {
    	      var attribute = _parchment2.default.query(name, _parchment2.default.Scope.BLOCK_ATTRIBUTE);
    	      if (attribute != null) {
    	        this.attributes.attribute(attribute, value);
    	      }
    	    }
    	  }, {
    	    key: 'formatAt',
    	    value: function formatAt(index, length, name, value) {
    	      this.format(name, value);
    	    }
    	  }, {
    	    key: 'insertAt',
    	    value: function insertAt(index, value, def) {
    	      if (typeof value === 'string' && value.endsWith('\n')) {
    	        var block = _parchment2.default.create(Block.blotName);
    	        this.parent.insertBefore(block, index === 0 ? this : this.next);
    	        block.insertAt(0, value.slice(0, -1));
    	      } else {
    	        _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'insertAt', this).call(this, index, value, def);
    	      }
    	    }
    	  }]);

    	  return BlockEmbed;
    	}(_parchment2.default.Embed);

    	BlockEmbed.scope = _parchment2.default.Scope.BLOCK_BLOT;
    	// It is important for cursor behavior BlockEmbeds use tags that are block level elements


    	var Block = function (_Parchment$Block) {
    	  _inherits(Block, _Parchment$Block);

    	  function Block(domNode) {
    	    _classCallCheck(this, Block);

    	    var _this2 = _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this, domNode));

    	    _this2.cache = {};
    	    return _this2;
    	  }

    	  _createClass(Block, [{
    	    key: 'delta',
    	    value: function delta() {
    	      if (this.cache.delta == null) {
    	        this.cache.delta = this.descendants(_parchment2.default.Leaf).reduce(function (delta, leaf) {
    	          if (leaf.length() === 0) {
    	            return delta;
    	          } else {
    	            return delta.insert(leaf.value(), bubbleFormats(leaf));
    	          }
    	        }, new _quillDelta2.default()).insert('\n', bubbleFormats(this));
    	      }
    	      return this.cache.delta;
    	    }
    	  }, {
    	    key: 'deleteAt',
    	    value: function deleteAt(index, length) {
    	      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'deleteAt', this).call(this, index, length);
    	      this.cache = {};
    	    }
    	  }, {
    	    key: 'formatAt',
    	    value: function formatAt(index, length, name, value) {
    	      if (length <= 0) return;
    	      if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
    	        if (index + length === this.length()) {
    	          this.format(name, value);
    	        }
    	      } else {
    	        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'formatAt', this).call(this, index, Math.min(length, this.length() - index - 1), name, value);
    	      }
    	      this.cache = {};
    	    }
    	  }, {
    	    key: 'insertAt',
    	    value: function insertAt(index, value, def) {
    	      if (def != null) return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, index, value, def);
    	      if (value.length === 0) return;
    	      var lines = value.split('\n');
    	      var text = lines.shift();
    	      if (text.length > 0) {
    	        if (index < this.length() - 1 || this.children.tail == null) {
    	          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, Math.min(index, this.length() - 1), text);
    	        } else {
    	          this.children.tail.insertAt(this.children.tail.length(), text);
    	        }
    	        this.cache = {};
    	      }
    	      var block = this;
    	      lines.reduce(function (index, line) {
    	        block = block.split(index, true);
    	        block.insertAt(0, line);
    	        return line.length;
    	      }, index + text.length);
    	    }
    	  }, {
    	    key: 'insertBefore',
    	    value: function insertBefore(blot, ref) {
    	      var head = this.children.head;
    	      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertBefore', this).call(this, blot, ref);
    	      if (head instanceof _break2.default) {
    	        head.remove();
    	      }
    	      this.cache = {};
    	    }
    	  }, {
    	    key: 'length',
    	    value: function length() {
    	      if (this.cache.length == null) {
    	        this.cache.length = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'length', this).call(this) + NEWLINE_LENGTH;
    	      }
    	      return this.cache.length;
    	    }
    	  }, {
    	    key: 'moveChildren',
    	    value: function moveChildren(target, ref) {
    	      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'moveChildren', this).call(this, target, ref);
    	      this.cache = {};
    	    }
    	  }, {
    	    key: 'optimize',
    	    value: function optimize(context) {
    	      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'optimize', this).call(this, context);
    	      this.cache = {};
    	    }
    	  }, {
    	    key: 'path',
    	    value: function path(index) {
    	      return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'path', this).call(this, index, true);
    	    }
    	  }, {
    	    key: 'removeChild',
    	    value: function removeChild(child) {
    	      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'removeChild', this).call(this, child);
    	      this.cache = {};
    	    }
    	  }, {
    	    key: 'split',
    	    value: function split(index) {
    	      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    	      if (force && (index === 0 || index >= this.length() - NEWLINE_LENGTH)) {
    	        var clone = this.clone();
    	        if (index === 0) {
    	          this.parent.insertBefore(clone, this);
    	          return this;
    	        } else {
    	          this.parent.insertBefore(clone, this.next);
    	          return clone;
    	        }
    	      } else {
    	        var next = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'split', this).call(this, index, force);
    	        this.cache = {};
    	        return next;
    	      }
    	    }
    	  }]);

    	  return Block;
    	}(_parchment2.default.Block);

    	Block.blotName = 'block';
    	Block.tagName = 'P';
    	Block.defaultChild = 'break';
    	Block.allowedChildren = [_inline2.default, _parchment2.default.Embed, _text2.default];

    	function bubbleFormats(blot) {
    	  var formats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    	  if (blot == null) return formats;
    	  if (typeof blot.formats === 'function') {
    	    formats = (0, _extend2.default)(formats, blot.formats());
    	  }
    	  if (blot.parent == null || blot.parent.blotName == 'scroll' || blot.parent.statics.scope !== blot.statics.scope) {
    	    return formats;
    	  }
    	  return bubbleFormats(blot.parent, formats);
    	}

    	exports.bubbleFormats = bubbleFormats;
    	exports.BlockEmbed = BlockEmbed;
    	exports.default = Block;

    	/***/ }),
    	/* 5 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.overload = exports.expandConfig = undefined;

    	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	__webpack_require__(50);

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _editor = __webpack_require__(14);

    	var _editor2 = _interopRequireDefault(_editor);

    	var _emitter3 = __webpack_require__(8);

    	var _emitter4 = _interopRequireDefault(_emitter3);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _selection = __webpack_require__(15);

    	var _selection2 = _interopRequireDefault(_selection);

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	var _logger = __webpack_require__(10);

    	var _logger2 = _interopRequireDefault(_logger);

    	var _theme = __webpack_require__(34);

    	var _theme2 = _interopRequireDefault(_theme);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var debug = (0, _logger2.default)('quill');

    	var Quill = function () {
    	  _createClass(Quill, null, [{
    	    key: 'debug',
    	    value: function debug(limit) {
    	      if (limit === true) {
    	        limit = 'log';
    	      }
    	      _logger2.default.level(limit);
    	    }
    	  }, {
    	    key: 'find',
    	    value: function find(node) {
    	      return node.__quill || _parchment2.default.find(node);
    	    }
    	  }, {
    	    key: 'import',
    	    value: function _import(name) {
    	      if (this.imports[name] == null) {
    	        debug.error('Cannot import ' + name + '. Are you sure it was registered?');
    	      }
    	      return this.imports[name];
    	    }
    	  }, {
    	    key: 'register',
    	    value: function register(path, target) {
    	      var _this = this;

    	      var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    	      if (typeof path !== 'string') {
    	        var name = path.attrName || path.blotName;
    	        if (typeof name === 'string') {
    	          // register(Blot | Attributor, overwrite)
    	          this.register('formats/' + name, path, target);
    	        } else {
    	          Object.keys(path).forEach(function (key) {
    	            _this.register(key, path[key], target);
    	          });
    	        }
    	      } else {
    	        if (this.imports[path] != null && !overwrite) {
    	          debug.warn('Overwriting ' + path + ' with', target);
    	        }
    	        this.imports[path] = target;
    	        if ((path.startsWith('blots/') || path.startsWith('formats/')) && target.blotName !== 'abstract') {
    	          _parchment2.default.register(target);
    	        } else if (path.startsWith('modules') && typeof target.register === 'function') {
    	          target.register();
    	        }
    	      }
    	    }
    	  }]);

    	  function Quill(container) {
    	    var _this2 = this;

    	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    	    _classCallCheck(this, Quill);

    	    this.options = expandConfig(container, options);
    	    this.container = this.options.container;
    	    if (this.container == null) {
    	      return debug.error('Invalid Quill container', container);
    	    }
    	    if (this.options.debug) {
    	      Quill.debug(this.options.debug);
    	    }
    	    var html = this.container.innerHTML.trim();
    	    this.container.classList.add('ql-container');
    	    this.container.innerHTML = '';
    	    this.container.__quill = this;
    	    this.root = this.addContainer('ql-editor');
    	    this.root.classList.add('ql-blank');
    	    this.root.setAttribute('data-gramm', false);
    	    this.scrollingContainer = this.options.scrollingContainer || this.root;
    	    this.emitter = new _emitter4.default();
    	    this.scroll = _parchment2.default.create(this.root, {
    	      emitter: this.emitter,
    	      whitelist: this.options.formats
    	    });
    	    this.editor = new _editor2.default(this.scroll);
    	    this.selection = new _selection2.default(this.scroll, this.emitter);
    	    this.theme = new this.options.theme(this, this.options);
    	    this.keyboard = this.theme.addModule('keyboard');
    	    this.clipboard = this.theme.addModule('clipboard');
    	    this.history = this.theme.addModule('history');
    	    this.theme.init();
    	    this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type) {
    	      if (type === _emitter4.default.events.TEXT_CHANGE) {
    	        _this2.root.classList.toggle('ql-blank', _this2.editor.isBlank());
    	      }
    	    });
    	    this.emitter.on(_emitter4.default.events.SCROLL_UPDATE, function (source, mutations) {
    	      var range = _this2.selection.lastRange;
    	      var index = range && range.length === 0 ? range.index : undefined;
    	      modify.call(_this2, function () {
    	        return _this2.editor.update(null, mutations, index);
    	      }, source);
    	    });
    	    var contents = this.clipboard.convert('<div class=\'ql-editor\' style="white-space: normal;">' + html + '<p><br></p></div>');
    	    this.setContents(contents);
    	    this.history.clear();
    	    if (this.options.placeholder) {
    	      this.root.setAttribute('data-placeholder', this.options.placeholder);
    	    }
    	    if (this.options.readOnly) {
    	      this.disable();
    	    }
    	  }

    	  _createClass(Quill, [{
    	    key: 'addContainer',
    	    value: function addContainer(container) {
    	      var refNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    	      if (typeof container === 'string') {
    	        var className = container;
    	        container = document.createElement('div');
    	        container.classList.add(className);
    	      }
    	      this.container.insertBefore(container, refNode);
    	      return container;
    	    }
    	  }, {
    	    key: 'blur',
    	    value: function blur() {
    	      this.selection.setRange(null);
    	    }
    	  }, {
    	    key: 'deleteText',
    	    value: function deleteText(index, length, source) {
    	      var _this3 = this;

    	      var _overload = overload(index, length, source);

    	      var _overload2 = _slicedToArray(_overload, 4);

    	      index = _overload2[0];
    	      length = _overload2[1];
    	      source = _overload2[3];

    	      return modify.call(this, function () {
    	        return _this3.editor.deleteText(index, length);
    	      }, source, index, -1 * length);
    	    }
    	  }, {
    	    key: 'disable',
    	    value: function disable() {
    	      this.enable(false);
    	    }
    	  }, {
    	    key: 'enable',
    	    value: function enable() {
    	      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    	      this.scroll.enable(enabled);
    	      this.container.classList.toggle('ql-disabled', !enabled);
    	    }
    	  }, {
    	    key: 'focus',
    	    value: function focus() {
    	      var scrollTop = this.scrollingContainer.scrollTop;
    	      this.selection.focus();
    	      this.scrollingContainer.scrollTop = scrollTop;
    	      this.scrollIntoView();
    	    }
    	  }, {
    	    key: 'format',
    	    value: function format(name, value) {
    	      var _this4 = this;

    	      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

    	      return modify.call(this, function () {
    	        var range = _this4.getSelection(true);
    	        var change = new _quillDelta2.default();
    	        if (range == null) {
    	          return change;
    	        } else if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
    	          change = _this4.editor.formatLine(range.index, range.length, _defineProperty({}, name, value));
    	        } else if (range.length === 0) {
    	          _this4.selection.format(name, value);
    	          return change;
    	        } else {
    	          change = _this4.editor.formatText(range.index, range.length, _defineProperty({}, name, value));
    	        }
    	        _this4.setSelection(range, _emitter4.default.sources.SILENT);
    	        return change;
    	      }, source);
    	    }
    	  }, {
    	    key: 'formatLine',
    	    value: function formatLine(index, length, name, value, source) {
    	      var _this5 = this;

    	      var formats = void 0;

    	      var _overload3 = overload(index, length, name, value, source);

    	      var _overload4 = _slicedToArray(_overload3, 4);

    	      index = _overload4[0];
    	      length = _overload4[1];
    	      formats = _overload4[2];
    	      source = _overload4[3];

    	      return modify.call(this, function () {
    	        return _this5.editor.formatLine(index, length, formats);
    	      }, source, index, 0);
    	    }
    	  }, {
    	    key: 'formatText',
    	    value: function formatText(index, length, name, value, source) {
    	      var _this6 = this;

    	      var formats = void 0;

    	      var _overload5 = overload(index, length, name, value, source);

    	      var _overload6 = _slicedToArray(_overload5, 4);

    	      index = _overload6[0];
    	      length = _overload6[1];
    	      formats = _overload6[2];
    	      source = _overload6[3];

    	      return modify.call(this, function () {
    	        return _this6.editor.formatText(index, length, formats);
    	      }, source, index, 0);
    	    }
    	  }, {
    	    key: 'getBounds',
    	    value: function getBounds(index) {
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    	      var bounds = void 0;
    	      if (typeof index === 'number') {
    	        bounds = this.selection.getBounds(index, length);
    	      } else {
    	        bounds = this.selection.getBounds(index.index, index.length);
    	      }
    	      var containerBounds = this.container.getBoundingClientRect();
    	      return {
    	        bottom: bounds.bottom - containerBounds.top,
    	        height: bounds.height,
    	        left: bounds.left - containerBounds.left,
    	        right: bounds.right - containerBounds.left,
    	        top: bounds.top - containerBounds.top,
    	        width: bounds.width
    	      };
    	    }
    	  }, {
    	    key: 'getContents',
    	    value: function getContents() {
    	      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

    	      var _overload7 = overload(index, length);

    	      var _overload8 = _slicedToArray(_overload7, 2);

    	      index = _overload8[0];
    	      length = _overload8[1];

    	      return this.editor.getContents(index, length);
    	    }
    	  }, {
    	    key: 'getFormat',
    	    value: function getFormat() {
    	      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getSelection(true);
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    	      if (typeof index === 'number') {
    	        return this.editor.getFormat(index, length);
    	      } else {
    	        return this.editor.getFormat(index.index, index.length);
    	      }
    	    }
    	  }, {
    	    key: 'getIndex',
    	    value: function getIndex(blot) {
    	      return blot.offset(this.scroll);
    	    }
    	  }, {
    	    key: 'getLength',
    	    value: function getLength() {
    	      return this.scroll.length();
    	    }
    	  }, {
    	    key: 'getLeaf',
    	    value: function getLeaf(index) {
    	      return this.scroll.leaf(index);
    	    }
    	  }, {
    	    key: 'getLine',
    	    value: function getLine(index) {
    	      return this.scroll.line(index);
    	    }
    	  }, {
    	    key: 'getLines',
    	    value: function getLines() {
    	      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

    	      if (typeof index !== 'number') {
    	        return this.scroll.lines(index.index, index.length);
    	      } else {
    	        return this.scroll.lines(index, length);
    	      }
    	    }
    	  }, {
    	    key: 'getModule',
    	    value: function getModule(name) {
    	      return this.theme.modules[name];
    	    }
    	  }, {
    	    key: 'getSelection',
    	    value: function getSelection() {
    	      var focus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    	      if (focus) this.focus();
    	      this.update(); // Make sure we access getRange with editor in consistent state
    	      return this.selection.getRange()[0];
    	    }
    	  }, {
    	    key: 'getText',
    	    value: function getText() {
    	      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

    	      var _overload9 = overload(index, length);

    	      var _overload10 = _slicedToArray(_overload9, 2);

    	      index = _overload10[0];
    	      length = _overload10[1];

    	      return this.editor.getText(index, length);
    	    }
    	  }, {
    	    key: 'hasFocus',
    	    value: function hasFocus() {
    	      return this.selection.hasFocus();
    	    }
    	  }, {
    	    key: 'insertEmbed',
    	    value: function insertEmbed(index, embed, value) {
    	      var _this7 = this;

    	      var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Quill.sources.API;

    	      return modify.call(this, function () {
    	        return _this7.editor.insertEmbed(index, embed, value);
    	      }, source, index);
    	    }
    	  }, {
    	    key: 'insertText',
    	    value: function insertText(index, text, name, value, source) {
    	      var _this8 = this;

    	      var formats = void 0;

    	      var _overload11 = overload(index, 0, name, value, source);

    	      var _overload12 = _slicedToArray(_overload11, 4);

    	      index = _overload12[0];
    	      formats = _overload12[2];
    	      source = _overload12[3];

    	      return modify.call(this, function () {
    	        return _this8.editor.insertText(index, text, formats);
    	      }, source, index, text.length);
    	    }
    	  }, {
    	    key: 'isEnabled',
    	    value: function isEnabled() {
    	      return !this.container.classList.contains('ql-disabled');
    	    }
    	  }, {
    	    key: 'off',
    	    value: function off() {
    	      return this.emitter.off.apply(this.emitter, arguments);
    	    }
    	  }, {
    	    key: 'on',
    	    value: function on() {
    	      return this.emitter.on.apply(this.emitter, arguments);
    	    }
    	  }, {
    	    key: 'once',
    	    value: function once() {
    	      return this.emitter.once.apply(this.emitter, arguments);
    	    }
    	  }, {
    	    key: 'pasteHTML',
    	    value: function pasteHTML(index, html, source) {
    	      this.clipboard.dangerouslyPasteHTML(index, html, source);
    	    }
    	  }, {
    	    key: 'removeFormat',
    	    value: function removeFormat(index, length, source) {
    	      var _this9 = this;

    	      var _overload13 = overload(index, length, source);

    	      var _overload14 = _slicedToArray(_overload13, 4);

    	      index = _overload14[0];
    	      length = _overload14[1];
    	      source = _overload14[3];

    	      return modify.call(this, function () {
    	        return _this9.editor.removeFormat(index, length);
    	      }, source, index);
    	    }
    	  }, {
    	    key: 'scrollIntoView',
    	    value: function scrollIntoView() {
    	      this.selection.scrollIntoView(this.scrollingContainer);
    	    }
    	  }, {
    	    key: 'setContents',
    	    value: function setContents(delta) {
    	      var _this10 = this;

    	      var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

    	      return modify.call(this, function () {
    	        delta = new _quillDelta2.default(delta);
    	        var length = _this10.getLength();
    	        var deleted = _this10.editor.deleteText(0, length);
    	        var applied = _this10.editor.applyDelta(delta);
    	        var lastOp = applied.ops[applied.ops.length - 1];
    	        if (lastOp != null && typeof lastOp.insert === 'string' && lastOp.insert[lastOp.insert.length - 1] === '\n') {
    	          _this10.editor.deleteText(_this10.getLength() - 1, 1);
    	          applied.delete(1);
    	        }
    	        var ret = deleted.compose(applied);
    	        return ret;
    	      }, source);
    	    }
    	  }, {
    	    key: 'setSelection',
    	    value: function setSelection(index, length, source) {
    	      if (index == null) {
    	        this.selection.setRange(null, length || Quill.sources.API);
    	      } else {
    	        var _overload15 = overload(index, length, source);

    	        var _overload16 = _slicedToArray(_overload15, 4);

    	        index = _overload16[0];
    	        length = _overload16[1];
    	        source = _overload16[3];

    	        this.selection.setRange(new _selection.Range(index, length), source);
    	        if (source !== _emitter4.default.sources.SILENT) {
    	          this.selection.scrollIntoView(this.scrollingContainer);
    	        }
    	      }
    	    }
    	  }, {
    	    key: 'setText',
    	    value: function setText(text) {
    	      var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

    	      var delta = new _quillDelta2.default().insert(text);
    	      return this.setContents(delta, source);
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update() {
    	      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

    	      var change = this.scroll.update(source); // Will update selection before selection.update() does if text changes
    	      this.selection.update(source);
    	      return change;
    	    }
    	  }, {
    	    key: 'updateContents',
    	    value: function updateContents(delta) {
    	      var _this11 = this;

    	      var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

    	      return modify.call(this, function () {
    	        delta = new _quillDelta2.default(delta);
    	        return _this11.editor.applyDelta(delta, source);
    	      }, source, true);
    	    }
    	  }]);

    	  return Quill;
    	}();

    	Quill.DEFAULTS = {
    	  bounds: null,
    	  formats: null,
    	  modules: {},
    	  placeholder: '',
    	  readOnly: false,
    	  scrollingContainer: null,
    	  strict: true,
    	  theme: 'default'
    	};
    	Quill.events = _emitter4.default.events;
    	Quill.sources = _emitter4.default.sources;
    	// eslint-disable-next-line no-undef
    	Quill.version =   "1.3.7";

    	Quill.imports = {
    	  'delta': _quillDelta2.default,
    	  'parchment': _parchment2.default,
    	  'core/module': _module2.default,
    	  'core/theme': _theme2.default
    	};

    	function expandConfig(container, userConfig) {
    	  userConfig = (0, _extend2.default)(true, {
    	    container: container,
    	    modules: {
    	      clipboard: true,
    	      keyboard: true,
    	      history: true
    	    }
    	  }, userConfig);
    	  if (!userConfig.theme || userConfig.theme === Quill.DEFAULTS.theme) {
    	    userConfig.theme = _theme2.default;
    	  } else {
    	    userConfig.theme = Quill.import('themes/' + userConfig.theme);
    	    if (userConfig.theme == null) {
    	      throw new Error('Invalid theme ' + userConfig.theme + '. Did you register it?');
    	    }
    	  }
    	  var themeConfig = (0, _extend2.default)(true, {}, userConfig.theme.DEFAULTS);
    	  [themeConfig, userConfig].forEach(function (config) {
    	    config.modules = config.modules || {};
    	    Object.keys(config.modules).forEach(function (module) {
    	      if (config.modules[module] === true) {
    	        config.modules[module] = {};
    	      }
    	    });
    	  });
    	  var moduleNames = Object.keys(themeConfig.modules).concat(Object.keys(userConfig.modules));
    	  var moduleConfig = moduleNames.reduce(function (config, name) {
    	    var moduleClass = Quill.import('modules/' + name);
    	    if (moduleClass == null) {
    	      debug.error('Cannot load ' + name + ' module. Are you sure you registered it?');
    	    } else {
    	      config[name] = moduleClass.DEFAULTS || {};
    	    }
    	    return config;
    	  }, {});
    	  // Special case toolbar shorthand
    	  if (userConfig.modules != null && userConfig.modules.toolbar && userConfig.modules.toolbar.constructor !== Object) {
    	    userConfig.modules.toolbar = {
    	      container: userConfig.modules.toolbar
    	    };
    	  }
    	  userConfig = (0, _extend2.default)(true, {}, Quill.DEFAULTS, { modules: moduleConfig }, themeConfig, userConfig);
    	  ['bounds', 'container', 'scrollingContainer'].forEach(function (key) {
    	    if (typeof userConfig[key] === 'string') {
    	      userConfig[key] = document.querySelector(userConfig[key]);
    	    }
    	  });
    	  userConfig.modules = Object.keys(userConfig.modules).reduce(function (config, name) {
    	    if (userConfig.modules[name]) {
    	      config[name] = userConfig.modules[name];
    	    }
    	    return config;
    	  }, {});
    	  return userConfig;
    	}

    	// Handle selection preservation and TEXT_CHANGE emission
    	// common to modification APIs
    	function modify(modifier, source, index, shift) {
    	  if (this.options.strict && !this.isEnabled() && source === _emitter4.default.sources.USER) {
    	    return new _quillDelta2.default();
    	  }
    	  var range = index == null ? null : this.getSelection();
    	  var oldDelta = this.editor.delta;
    	  var change = modifier();
    	  if (range != null) {
    	    if (index === true) index = range.index;
    	    if (shift == null) {
    	      range = shiftRange(range, change, source);
    	    } else if (shift !== 0) {
    	      range = shiftRange(range, index, shift, source);
    	    }
    	    this.setSelection(range, _emitter4.default.sources.SILENT);
    	  }
    	  if (change.length() > 0) {
    	    var _emitter;

    	    var args = [_emitter4.default.events.TEXT_CHANGE, change, oldDelta, source];
    	    (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
    	    if (source !== _emitter4.default.sources.SILENT) {
    	      var _emitter2;

    	      (_emitter2 = this.emitter).emit.apply(_emitter2, args);
    	    }
    	  }
    	  return change;
    	}

    	function overload(index, length, name, value, source) {
    	  var formats = {};
    	  if (typeof index.index === 'number' && typeof index.length === 'number') {
    	    // Allow for throwaway end (used by insertText/insertEmbed)
    	    if (typeof length !== 'number') {
    	      source = value, value = name, name = length, length = index.length, index = index.index;
    	    } else {
    	      length = index.length, index = index.index;
    	    }
    	  } else if (typeof length !== 'number') {
    	    source = value, value = name, name = length, length = 0;
    	  }
    	  // Handle format being object, two format name/value strings or excluded
    	  if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
    	    formats = name;
    	    source = value;
    	  } else if (typeof name === 'string') {
    	    if (value != null) {
    	      formats[name] = value;
    	    } else {
    	      source = name;
    	    }
    	  }
    	  // Handle optional source
    	  source = source || _emitter4.default.sources.API;
    	  return [index, length, formats, source];
    	}

    	function shiftRange(range, index, length, source) {
    	  if (range == null) return null;
    	  var start = void 0,
    	      end = void 0;
    	  if (index instanceof _quillDelta2.default) {
    	    var _map = [range.index, range.index + range.length].map(function (pos) {
    	      return index.transformPosition(pos, source !== _emitter4.default.sources.USER);
    	    });

    	    var _map2 = _slicedToArray(_map, 2);

    	    start = _map2[0];
    	    end = _map2[1];
    	  } else {
    	    var _map3 = [range.index, range.index + range.length].map(function (pos) {
    	      if (pos < index || pos === index && source === _emitter4.default.sources.USER) return pos;
    	      if (length >= 0) {
    	        return pos + length;
    	      } else {
    	        return Math.max(index, pos + length);
    	      }
    	    });

    	    var _map4 = _slicedToArray(_map3, 2);

    	    start = _map4[0];
    	    end = _map4[1];
    	  }
    	  return new _selection.Range(start, end - start);
    	}

    	exports.expandConfig = expandConfig;
    	exports.overload = overload;
    	exports.default = Quill;

    	/***/ }),
    	/* 6 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _text = __webpack_require__(7);

    	var _text2 = _interopRequireDefault(_text);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Inline = function (_Parchment$Inline) {
    	  _inherits(Inline, _Parchment$Inline);

    	  function Inline() {
    	    _classCallCheck(this, Inline);

    	    return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
    	  }

    	  _createClass(Inline, [{
    	    key: 'formatAt',
    	    value: function formatAt(index, length, name, value) {
    	      if (Inline.compare(this.statics.blotName, name) < 0 && _parchment2.default.query(name, _parchment2.default.Scope.BLOT)) {
    	        var blot = this.isolate(index, length);
    	        if (value) {
    	          blot.wrap(name, value);
    	        }
    	      } else {
    	        _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'formatAt', this).call(this, index, length, name, value);
    	      }
    	    }
    	  }, {
    	    key: 'optimize',
    	    value: function optimize(context) {
    	      _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'optimize', this).call(this, context);
    	      if (this.parent instanceof Inline && Inline.compare(this.statics.blotName, this.parent.statics.blotName) > 0) {
    	        var parent = this.parent.isolate(this.offset(), this.length());
    	        this.moveChildren(parent);
    	        parent.wrap(this);
    	      }
    	    }
    	  }], [{
    	    key: 'compare',
    	    value: function compare(self, other) {
    	      var selfIndex = Inline.order.indexOf(self);
    	      var otherIndex = Inline.order.indexOf(other);
    	      if (selfIndex >= 0 || otherIndex >= 0) {
    	        return selfIndex - otherIndex;
    	      } else if (self === other) {
    	        return 0;
    	      } else if (self < other) {
    	        return -1;
    	      } else {
    	        return 1;
    	      }
    	    }
    	  }]);

    	  return Inline;
    	}(_parchment2.default.Inline);

    	Inline.allowedChildren = [Inline, _parchment2.default.Embed, _text2.default];
    	// Lower index means deeper in the DOM tree, since not found (-1) is for embeds
    	Inline.order = ['cursor', 'inline', // Must be lower
    	'underline', 'strike', 'italic', 'bold', 'script', 'link', 'code' // Must be higher
    	];

    	exports.default = Inline;

    	/***/ }),
    	/* 7 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var TextBlot = function (_Parchment$Text) {
    	  _inherits(TextBlot, _Parchment$Text);

    	  function TextBlot() {
    	    _classCallCheck(this, TextBlot);

    	    return _possibleConstructorReturn(this, (TextBlot.__proto__ || Object.getPrototypeOf(TextBlot)).apply(this, arguments));
    	  }

    	  return TextBlot;
    	}(_parchment2.default.Text);

    	exports.default = TextBlot;

    	/***/ }),
    	/* 8 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _eventemitter = __webpack_require__(54);

    	var _eventemitter2 = _interopRequireDefault(_eventemitter);

    	var _logger = __webpack_require__(10);

    	var _logger2 = _interopRequireDefault(_logger);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var debug = (0, _logger2.default)('quill:events');

    	var EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

    	EVENTS.forEach(function (eventName) {
    	  document.addEventListener(eventName, function () {
    	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    	      args[_key] = arguments[_key];
    	    }

    	    [].slice.call(document.querySelectorAll('.ql-container')).forEach(function (node) {
    	      // TODO use WeakMap
    	      if (node.__quill && node.__quill.emitter) {
    	        var _node$__quill$emitter;

    	        (_node$__quill$emitter = node.__quill.emitter).handleDOM.apply(_node$__quill$emitter, args);
    	      }
    	    });
    	  });
    	});

    	var Emitter = function (_EventEmitter) {
    	  _inherits(Emitter, _EventEmitter);

    	  function Emitter() {
    	    _classCallCheck(this, Emitter);

    	    var _this = _possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

    	    _this.listeners = {};
    	    _this.on('error', debug.error);
    	    return _this;
    	  }

    	  _createClass(Emitter, [{
    	    key: 'emit',
    	    value: function emit() {
    	      debug.log.apply(debug, arguments);
    	      _get(Emitter.prototype.__proto__ || Object.getPrototypeOf(Emitter.prototype), 'emit', this).apply(this, arguments);
    	    }
    	  }, {
    	    key: 'handleDOM',
    	    value: function handleDOM(event) {
    	      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    	        args[_key2 - 1] = arguments[_key2];
    	      }

    	      (this.listeners[event.type] || []).forEach(function (_ref) {
    	        var node = _ref.node,
    	            handler = _ref.handler;

    	        if (event.target === node || node.contains(event.target)) {
    	          handler.apply(undefined, [event].concat(args));
    	        }
    	      });
    	    }
    	  }, {
    	    key: 'listenDOM',
    	    value: function listenDOM(eventName, node, handler) {
    	      if (!this.listeners[eventName]) {
    	        this.listeners[eventName] = [];
    	      }
    	      this.listeners[eventName].push({ node: node, handler: handler });
    	    }
    	  }]);

    	  return Emitter;
    	}(_eventemitter2.default);

    	Emitter.events = {
    	  EDITOR_CHANGE: 'editor-change',
    	  SCROLL_BEFORE_UPDATE: 'scroll-before-update',
    	  SCROLL_OPTIMIZE: 'scroll-optimize',
    	  SCROLL_UPDATE: 'scroll-update',
    	  SELECTION_CHANGE: 'selection-change',
    	  TEXT_CHANGE: 'text-change'
    	};
    	Emitter.sources = {
    	  API: 'api',
    	  SILENT: 'silent',
    	  USER: 'user'
    	};

    	exports.default = Emitter;

    	/***/ }),
    	/* 9 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var Module = function Module(quill) {
    	  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    	  _classCallCheck(this, Module);

    	  this.quill = quill;
    	  this.options = options;
    	};

    	Module.DEFAULTS = {};

    	exports.default = Module;

    	/***/ }),
    	/* 10 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	var levels = ['error', 'warn', 'log', 'info'];
    	var level = 'warn';

    	function debug(method) {
    	  if (levels.indexOf(method) <= levels.indexOf(level)) {
    	    var _console;

    	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    	      args[_key - 1] = arguments[_key];
    	    }

    	    (_console = console)[method].apply(_console, args); // eslint-disable-line no-console
    	  }
    	}

    	function namespace(ns) {
    	  return levels.reduce(function (logger, method) {
    	    logger[method] = debug.bind(console, method, ns);
    	    return logger;
    	  }, {});
    	}

    	debug.level = namespace.level = function (newLevel) {
    	  level = newLevel;
    	};

    	exports.default = namespace;

    	/***/ }),
    	/* 11 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var pSlice = Array.prototype.slice;
    	var objectKeys = __webpack_require__(52);
    	var isArguments = __webpack_require__(53);

    	var deepEqual = module.exports = function (actual, expected, opts) {
    	  if (!opts) opts = {};
    	  // 7.1. All identical values are equivalent, as determined by ===.
    	  if (actual === expected) {
    	    return true;

    	  } else if (actual instanceof Date && expected instanceof Date) {
    	    return actual.getTime() === expected.getTime();

    	  // 7.3. Other pairs that do not both pass typeof value == 'object',
    	  // equivalence is determined by ==.
    	  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    	    return opts.strict ? actual === expected : actual == expected;

    	  // 7.4. For all other Object pairs, including Array objects, equivalence is
    	  // determined by having the same number of owned properties (as verified
    	  // with Object.prototype.hasOwnProperty.call), the same set of keys
    	  // (although not necessarily the same order), equivalent values for every
    	  // corresponding key, and an identical 'prototype' property. Note: this
    	  // accounts for both named and indexed properties on Arrays.
    	  } else {
    	    return objEquiv(actual, expected, opts);
    	  }
    	};

    	function isUndefinedOrNull(value) {
    	  return value === null || value === undefined;
    	}

    	function isBuffer (x) {
    	  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
    	  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    	    return false;
    	  }
    	  if (x.length > 0 && typeof x[0] !== 'number') return false;
    	  return true;
    	}

    	function objEquiv(a, b, opts) {
    	  var i, key;
    	  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    	    return false;
    	  // an identical 'prototype' property.
    	  if (a.prototype !== b.prototype) return false;
    	  //~~~I've managed to break Object.keys through screwy arguments passing.
    	  //   Converting to array solves the problem.
    	  if (isArguments(a)) {
    	    if (!isArguments(b)) {
    	      return false;
    	    }
    	    a = pSlice.call(a);
    	    b = pSlice.call(b);
    	    return deepEqual(a, b, opts);
    	  }
    	  if (isBuffer(a)) {
    	    if (!isBuffer(b)) {
    	      return false;
    	    }
    	    if (a.length !== b.length) return false;
    	    for (i = 0; i < a.length; i++) {
    	      if (a[i] !== b[i]) return false;
    	    }
    	    return true;
    	  }
    	  try {
    	    var ka = objectKeys(a),
    	        kb = objectKeys(b);
    	  } catch (e) {//happens when one is a string literal and the other isn't
    	    return false;
    	  }
    	  // having the same number of owned properties (keys incorporates
    	  // hasOwnProperty)
    	  if (ka.length != kb.length)
    	    return false;
    	  //the same set of keys (although not necessarily the same order),
    	  ka.sort();
    	  kb.sort();
    	  //~~~cheap key test
    	  for (i = ka.length - 1; i >= 0; i--) {
    	    if (ka[i] != kb[i])
    	      return false;
    	  }
    	  //equivalent values for every corresponding key, and
    	  //~~~possibly expensive deep test
    	  for (i = ka.length - 1; i >= 0; i--) {
    	    key = ka[i];
    	    if (!deepEqual(a[key], b[key], opts)) return false;
    	  }
    	  return typeof a === typeof b;
    	}


    	/***/ }),
    	/* 12 */
    	/***/ (function(module, exports, __webpack_require__) {

    	Object.defineProperty(exports, "__esModule", { value: true });
    	var Registry = __webpack_require__(1);
    	var Attributor = /** @class */ (function () {
    	    function Attributor(attrName, keyName, options) {
    	        if (options === void 0) { options = {}; }
    	        this.attrName = attrName;
    	        this.keyName = keyName;
    	        var attributeBit = Registry.Scope.TYPE & Registry.Scope.ATTRIBUTE;
    	        if (options.scope != null) {
    	            // Ignore type bits, force attribute bit
    	            this.scope = (options.scope & Registry.Scope.LEVEL) | attributeBit;
    	        }
    	        else {
    	            this.scope = Registry.Scope.ATTRIBUTE;
    	        }
    	        if (options.whitelist != null)
    	            this.whitelist = options.whitelist;
    	    }
    	    Attributor.keys = function (node) {
    	        return [].map.call(node.attributes, function (item) {
    	            return item.name;
    	        });
    	    };
    	    Attributor.prototype.add = function (node, value) {
    	        if (!this.canAdd(node, value))
    	            return false;
    	        node.setAttribute(this.keyName, value);
    	        return true;
    	    };
    	    Attributor.prototype.canAdd = function (node, value) {
    	        var match = Registry.query(node, Registry.Scope.BLOT & (this.scope | Registry.Scope.TYPE));
    	        if (match == null)
    	            return false;
    	        if (this.whitelist == null)
    	            return true;
    	        if (typeof value === 'string') {
    	            return this.whitelist.indexOf(value.replace(/["']/g, '')) > -1;
    	        }
    	        else {
    	            return this.whitelist.indexOf(value) > -1;
    	        }
    	    };
    	    Attributor.prototype.remove = function (node) {
    	        node.removeAttribute(this.keyName);
    	    };
    	    Attributor.prototype.value = function (node) {
    	        var value = node.getAttribute(this.keyName);
    	        if (this.canAdd(node, value) && value) {
    	            return value;
    	        }
    	        return '';
    	    };
    	    return Attributor;
    	}());
    	exports.default = Attributor;


    	/***/ }),
    	/* 13 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.Code = undefined;

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	var _text = __webpack_require__(7);

    	var _text2 = _interopRequireDefault(_text);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Code = function (_Inline) {
    	  _inherits(Code, _Inline);

    	  function Code() {
    	    _classCallCheck(this, Code);

    	    return _possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).apply(this, arguments));
    	  }

    	  return Code;
    	}(_inline2.default);

    	Code.blotName = 'code';
    	Code.tagName = 'CODE';

    	var CodeBlock = function (_Block) {
    	  _inherits(CodeBlock, _Block);

    	  function CodeBlock() {
    	    _classCallCheck(this, CodeBlock);

    	    return _possibleConstructorReturn(this, (CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock)).apply(this, arguments));
    	  }

    	  _createClass(CodeBlock, [{
    	    key: 'delta',
    	    value: function delta() {
    	      var _this3 = this;

    	      var text = this.domNode.textContent;
    	      if (text.endsWith('\n')) {
    	        // Should always be true
    	        text = text.slice(0, -1);
    	      }
    	      return text.split('\n').reduce(function (delta, frag) {
    	        return delta.insert(frag).insert('\n', _this3.formats());
    	      }, new _quillDelta2.default());
    	    }
    	  }, {
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (name === this.statics.blotName && value) return;

    	      var _descendant = this.descendant(_text2.default, this.length() - 1),
    	          _descendant2 = _slicedToArray(_descendant, 1),
    	          text = _descendant2[0];

    	      if (text != null) {
    	        text.deleteAt(text.length() - 1, 1);
    	      }
    	      _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'format', this).call(this, name, value);
    	    }
    	  }, {
    	    key: 'formatAt',
    	    value: function formatAt(index, length, name, value) {
    	      if (length === 0) return;
    	      if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK) == null || name === this.statics.blotName && value === this.statics.formats(this.domNode)) {
    	        return;
    	      }
    	      var nextNewline = this.newlineIndex(index);
    	      if (nextNewline < 0 || nextNewline >= index + length) return;
    	      var prevNewline = this.newlineIndex(index, true) + 1;
    	      var isolateLength = nextNewline - prevNewline + 1;
    	      var blot = this.isolate(prevNewline, isolateLength);
    	      var next = blot.next;
    	      blot.format(name, value);
    	      if (next instanceof CodeBlock) {
    	        next.formatAt(0, index - prevNewline + length - isolateLength, name, value);
    	      }
    	    }
    	  }, {
    	    key: 'insertAt',
    	    value: function insertAt(index, value, def) {
    	      if (def != null) return;

    	      var _descendant3 = this.descendant(_text2.default, index),
    	          _descendant4 = _slicedToArray(_descendant3, 2),
    	          text = _descendant4[0],
    	          offset = _descendant4[1];

    	      text.insertAt(offset, value);
    	    }
    	  }, {
    	    key: 'length',
    	    value: function length() {
    	      var length = this.domNode.textContent.length;
    	      if (!this.domNode.textContent.endsWith('\n')) {
    	        return length + 1;
    	      }
    	      return length;
    	    }
    	  }, {
    	    key: 'newlineIndex',
    	    value: function newlineIndex(searchIndex) {
    	      var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    	      if (!reverse) {
    	        var offset = this.domNode.textContent.slice(searchIndex).indexOf('\n');
    	        return offset > -1 ? searchIndex + offset : -1;
    	      } else {
    	        return this.domNode.textContent.slice(0, searchIndex).lastIndexOf('\n');
    	      }
    	    }
    	  }, {
    	    key: 'optimize',
    	    value: function optimize(context) {
    	      if (!this.domNode.textContent.endsWith('\n')) {
    	        this.appendChild(_parchment2.default.create('text', '\n'));
    	      }
    	      _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'optimize', this).call(this, context);
    	      var next = this.next;
    	      if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && this.statics.formats(this.domNode) === next.statics.formats(next.domNode)) {
    	        next.optimize(context);
    	        next.moveChildren(this);
    	        next.remove();
    	      }
    	    }
    	  }, {
    	    key: 'replace',
    	    value: function replace(target) {
    	      _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'replace', this).call(this, target);
    	      [].slice.call(this.domNode.querySelectorAll('*')).forEach(function (node) {
    	        var blot = _parchment2.default.find(node);
    	        if (blot == null) {
    	          node.parentNode.removeChild(node);
    	        } else if (blot instanceof _parchment2.default.Embed) {
    	          blot.remove();
    	        } else {
    	          blot.unwrap();
    	        }
    	      });
    	    }
    	  }], [{
    	    key: 'create',
    	    value: function create(value) {
    	      var domNode = _get(CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock), 'create', this).call(this, value);
    	      domNode.setAttribute('spellcheck', false);
    	      return domNode;
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats() {
    	      return true;
    	    }
    	  }]);

    	  return CodeBlock;
    	}(_block2.default);

    	CodeBlock.blotName = 'code-block';
    	CodeBlock.tagName = 'PRE';
    	CodeBlock.TAB = '  ';

    	exports.Code = Code;
    	exports.default = CodeBlock;

    	/***/ }),
    	/* 14 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _op = __webpack_require__(20);

    	var _op2 = _interopRequireDefault(_op);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _code = __webpack_require__(13);

    	var _code2 = _interopRequireDefault(_code);

    	var _cursor = __webpack_require__(24);

    	var _cursor2 = _interopRequireDefault(_cursor);

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	var _break = __webpack_require__(16);

    	var _break2 = _interopRequireDefault(_break);

    	var _clone = __webpack_require__(21);

    	var _clone2 = _interopRequireDefault(_clone);

    	var _deepEqual = __webpack_require__(11);

    	var _deepEqual2 = _interopRequireDefault(_deepEqual);

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var ASCII = /^[ -~]*$/;

    	var Editor = function () {
    	  function Editor(scroll) {
    	    _classCallCheck(this, Editor);

    	    this.scroll = scroll;
    	    this.delta = this.getDelta();
    	  }

    	  _createClass(Editor, [{
    	    key: 'applyDelta',
    	    value: function applyDelta(delta) {
    	      var _this = this;

    	      var consumeNextNewline = false;
    	      this.scroll.update();
    	      var scrollLength = this.scroll.length();
    	      this.scroll.batchStart();
    	      delta = normalizeDelta(delta);
    	      delta.reduce(function (index, op) {
    	        var length = op.retain || op.delete || op.insert.length || 1;
    	        var attributes = op.attributes || {};
    	        if (op.insert != null) {
    	          if (typeof op.insert === 'string') {
    	            var text = op.insert;
    	            if (text.endsWith('\n') && consumeNextNewline) {
    	              consumeNextNewline = false;
    	              text = text.slice(0, -1);
    	            }
    	            if (index >= scrollLength && !text.endsWith('\n')) {
    	              consumeNextNewline = true;
    	            }
    	            _this.scroll.insertAt(index, text);

    	            var _scroll$line = _this.scroll.line(index),
    	                _scroll$line2 = _slicedToArray(_scroll$line, 2),
    	                line = _scroll$line2[0],
    	                offset = _scroll$line2[1];

    	            var formats = (0, _extend2.default)({}, (0, _block.bubbleFormats)(line));
    	            if (line instanceof _block2.default) {
    	              var _line$descendant = line.descendant(_parchment2.default.Leaf, offset),
    	                  _line$descendant2 = _slicedToArray(_line$descendant, 1),
    	                  leaf = _line$descendant2[0];

    	              formats = (0, _extend2.default)(formats, (0, _block.bubbleFormats)(leaf));
    	            }
    	            attributes = _op2.default.attributes.diff(formats, attributes) || {};
    	          } else if (_typeof(op.insert) === 'object') {
    	            var key = Object.keys(op.insert)[0]; // There should only be one key
    	            if (key == null) return index;
    	            _this.scroll.insertAt(index, key, op.insert[key]);
    	          }
    	          scrollLength += length;
    	        }
    	        Object.keys(attributes).forEach(function (name) {
    	          _this.scroll.formatAt(index, length, name, attributes[name]);
    	        });
    	        return index + length;
    	      }, 0);
    	      delta.reduce(function (index, op) {
    	        if (typeof op.delete === 'number') {
    	          _this.scroll.deleteAt(index, op.delete);
    	          return index;
    	        }
    	        return index + (op.retain || op.insert.length || 1);
    	      }, 0);
    	      this.scroll.batchEnd();
    	      return this.update(delta);
    	    }
    	  }, {
    	    key: 'deleteText',
    	    value: function deleteText(index, length) {
    	      this.scroll.deleteAt(index, length);
    	      return this.update(new _quillDelta2.default().retain(index).delete(length));
    	    }
    	  }, {
    	    key: 'formatLine',
    	    value: function formatLine(index, length) {
    	      var _this2 = this;

    	      var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    	      this.scroll.update();
    	      Object.keys(formats).forEach(function (format) {
    	        if (_this2.scroll.whitelist != null && !_this2.scroll.whitelist[format]) return;
    	        var lines = _this2.scroll.lines(index, Math.max(length, 1));
    	        var lengthRemaining = length;
    	        lines.forEach(function (line) {
    	          var lineLength = line.length();
    	          if (!(line instanceof _code2.default)) {
    	            line.format(format, formats[format]);
    	          } else {
    	            var codeIndex = index - line.offset(_this2.scroll);
    	            var codeLength = line.newlineIndex(codeIndex + lengthRemaining) - codeIndex + 1;
    	            line.formatAt(codeIndex, codeLength, format, formats[format]);
    	          }
    	          lengthRemaining -= lineLength;
    	        });
    	      });
    	      this.scroll.optimize();
    	      return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
    	    }
    	  }, {
    	    key: 'formatText',
    	    value: function formatText(index, length) {
    	      var _this3 = this;

    	      var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    	      Object.keys(formats).forEach(function (format) {
    	        _this3.scroll.formatAt(index, length, format, formats[format]);
    	      });
    	      return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
    	    }
    	  }, {
    	    key: 'getContents',
    	    value: function getContents(index, length) {
    	      return this.delta.slice(index, index + length);
    	    }
    	  }, {
    	    key: 'getDelta',
    	    value: function getDelta() {
    	      return this.scroll.lines().reduce(function (delta, line) {
    	        return delta.concat(line.delta());
    	      }, new _quillDelta2.default());
    	    }
    	  }, {
    	    key: 'getFormat',
    	    value: function getFormat(index) {
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    	      var lines = [],
    	          leaves = [];
    	      if (length === 0) {
    	        this.scroll.path(index).forEach(function (path) {
    	          var _path = _slicedToArray(path, 1),
    	              blot = _path[0];

    	          if (blot instanceof _block2.default) {
    	            lines.push(blot);
    	          } else if (blot instanceof _parchment2.default.Leaf) {
    	            leaves.push(blot);
    	          }
    	        });
    	      } else {
    	        lines = this.scroll.lines(index, length);
    	        leaves = this.scroll.descendants(_parchment2.default.Leaf, index, length);
    	      }
    	      var formatsArr = [lines, leaves].map(function (blots) {
    	        if (blots.length === 0) return {};
    	        var formats = (0, _block.bubbleFormats)(blots.shift());
    	        while (Object.keys(formats).length > 0) {
    	          var blot = blots.shift();
    	          if (blot == null) return formats;
    	          formats = combineFormats((0, _block.bubbleFormats)(blot), formats);
    	        }
    	        return formats;
    	      });
    	      return _extend2.default.apply(_extend2.default, formatsArr);
    	    }
    	  }, {
    	    key: 'getText',
    	    value: function getText(index, length) {
    	      return this.getContents(index, length).filter(function (op) {
    	        return typeof op.insert === 'string';
    	      }).map(function (op) {
    	        return op.insert;
    	      }).join('');
    	    }
    	  }, {
    	    key: 'insertEmbed',
    	    value: function insertEmbed(index, embed, value) {
    	      this.scroll.insertAt(index, embed, value);
    	      return this.update(new _quillDelta2.default().retain(index).insert(_defineProperty({}, embed, value)));
    	    }
    	  }, {
    	    key: 'insertText',
    	    value: function insertText(index, text) {
    	      var _this4 = this;

    	      var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    	      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    	      this.scroll.insertAt(index, text);
    	      Object.keys(formats).forEach(function (format) {
    	        _this4.scroll.formatAt(index, text.length, format, formats[format]);
    	      });
    	      return this.update(new _quillDelta2.default().retain(index).insert(text, (0, _clone2.default)(formats)));
    	    }
    	  }, {
    	    key: 'isBlank',
    	    value: function isBlank() {
    	      if (this.scroll.children.length == 0) return true;
    	      if (this.scroll.children.length > 1) return false;
    	      var block = this.scroll.children.head;
    	      if (block.statics.blotName !== _block2.default.blotName) return false;
    	      if (block.children.length > 1) return false;
    	      return block.children.head instanceof _break2.default;
    	    }
    	  }, {
    	    key: 'removeFormat',
    	    value: function removeFormat(index, length) {
    	      var text = this.getText(index, length);

    	      var _scroll$line3 = this.scroll.line(index + length),
    	          _scroll$line4 = _slicedToArray(_scroll$line3, 2),
    	          line = _scroll$line4[0],
    	          offset = _scroll$line4[1];

    	      var suffixLength = 0,
    	          suffix = new _quillDelta2.default();
    	      if (line != null) {
    	        if (!(line instanceof _code2.default)) {
    	          suffixLength = line.length() - offset;
    	        } else {
    	          suffixLength = line.newlineIndex(offset) - offset + 1;
    	        }
    	        suffix = line.delta().slice(offset, offset + suffixLength - 1).insert('\n');
    	      }
    	      var contents = this.getContents(index, length + suffixLength);
    	      var diff = contents.diff(new _quillDelta2.default().insert(text).concat(suffix));
    	      var delta = new _quillDelta2.default().retain(index).concat(diff);
    	      return this.applyDelta(delta);
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update(change) {
    	      var mutations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    	      var cursorIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    	      var oldDelta = this.delta;
    	      if (mutations.length === 1 && mutations[0].type === 'characterData' && mutations[0].target.data.match(ASCII) && _parchment2.default.find(mutations[0].target)) {
    	        // Optimization for character changes
    	        var textBlot = _parchment2.default.find(mutations[0].target);
    	        var formats = (0, _block.bubbleFormats)(textBlot);
    	        var index = textBlot.offset(this.scroll);
    	        var oldValue = mutations[0].oldValue.replace(_cursor2.default.CONTENTS, '');
    	        var oldText = new _quillDelta2.default().insert(oldValue);
    	        var newText = new _quillDelta2.default().insert(textBlot.value());
    	        var diffDelta = new _quillDelta2.default().retain(index).concat(oldText.diff(newText, cursorIndex));
    	        change = diffDelta.reduce(function (delta, op) {
    	          if (op.insert) {
    	            return delta.insert(op.insert, formats);
    	          } else {
    	            return delta.push(op);
    	          }
    	        }, new _quillDelta2.default());
    	        this.delta = oldDelta.compose(change);
    	      } else {
    	        this.delta = this.getDelta();
    	        if (!change || !(0, _deepEqual2.default)(oldDelta.compose(change), this.delta)) {
    	          change = oldDelta.diff(this.delta, cursorIndex);
    	        }
    	      }
    	      return change;
    	    }
    	  }]);

    	  return Editor;
    	}();

    	function combineFormats(formats, combined) {
    	  return Object.keys(combined).reduce(function (merged, name) {
    	    if (formats[name] == null) return merged;
    	    if (combined[name] === formats[name]) {
    	      merged[name] = combined[name];
    	    } else if (Array.isArray(combined[name])) {
    	      if (combined[name].indexOf(formats[name]) < 0) {
    	        merged[name] = combined[name].concat([formats[name]]);
    	      }
    	    } else {
    	      merged[name] = [combined[name], formats[name]];
    	    }
    	    return merged;
    	  }, {});
    	}

    	function normalizeDelta(delta) {
    	  return delta.reduce(function (delta, op) {
    	    if (op.insert === 1) {
    	      var attributes = (0, _clone2.default)(op.attributes);
    	      delete attributes['image'];
    	      return delta.insert({ image: op.attributes.image }, attributes);
    	    }
    	    if (op.attributes != null && (op.attributes.list === true || op.attributes.bullet === true)) {
    	      op = (0, _clone2.default)(op);
    	      if (op.attributes.list) {
    	        op.attributes.list = 'ordered';
    	      } else {
    	        op.attributes.list = 'bullet';
    	        delete op.attributes.bullet;
    	      }
    	    }
    	    if (typeof op.insert === 'string') {
    	      var text = op.insert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    	      return delta.insert(text, op.attributes);
    	    }
    	    return delta.push(op);
    	  }, new _quillDelta2.default());
    	}

    	exports.default = Editor;

    	/***/ }),
    	/* 15 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.Range = undefined;

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _clone = __webpack_require__(21);

    	var _clone2 = _interopRequireDefault(_clone);

    	var _deepEqual = __webpack_require__(11);

    	var _deepEqual2 = _interopRequireDefault(_deepEqual);

    	var _emitter3 = __webpack_require__(8);

    	var _emitter4 = _interopRequireDefault(_emitter3);

    	var _logger = __webpack_require__(10);

    	var _logger2 = _interopRequireDefault(_logger);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var debug = (0, _logger2.default)('quill:selection');

    	var Range = function Range(index) {
    	  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    	  _classCallCheck(this, Range);

    	  this.index = index;
    	  this.length = length;
    	};

    	var Selection = function () {
    	  function Selection(scroll, emitter) {
    	    var _this = this;

    	    _classCallCheck(this, Selection);

    	    this.emitter = emitter;
    	    this.scroll = scroll;
    	    this.composing = false;
    	    this.mouseDown = false;
    	    this.root = this.scroll.domNode;
    	    this.cursor = _parchment2.default.create('cursor', this);
    	    // savedRange is last non-null range
    	    this.lastRange = this.savedRange = new Range(0, 0);
    	    this.handleComposition();
    	    this.handleDragging();
    	    this.emitter.listenDOM('selectionchange', document, function () {
    	      if (!_this.mouseDown) {
    	        setTimeout(_this.update.bind(_this, _emitter4.default.sources.USER), 1);
    	      }
    	    });
    	    this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type, delta) {
    	      if (type === _emitter4.default.events.TEXT_CHANGE && delta.length() > 0) {
    	        _this.update(_emitter4.default.sources.SILENT);
    	      }
    	    });
    	    this.emitter.on(_emitter4.default.events.SCROLL_BEFORE_UPDATE, function () {
    	      if (!_this.hasFocus()) return;
    	      var native = _this.getNativeRange();
    	      if (native == null) return;
    	      if (native.start.node === _this.cursor.textNode) return; // cursor.restore() will handle
    	      // TODO unclear if this has negative side effects
    	      _this.emitter.once(_emitter4.default.events.SCROLL_UPDATE, function () {
    	        try {
    	          _this.setNativeRange(native.start.node, native.start.offset, native.end.node, native.end.offset);
    	        } catch (ignored) {}
    	      });
    	    });
    	    this.emitter.on(_emitter4.default.events.SCROLL_OPTIMIZE, function (mutations, context) {
    	      if (context.range) {
    	        var _context$range = context.range,
    	            startNode = _context$range.startNode,
    	            startOffset = _context$range.startOffset,
    	            endNode = _context$range.endNode,
    	            endOffset = _context$range.endOffset;

    	        _this.setNativeRange(startNode, startOffset, endNode, endOffset);
    	      }
    	    });
    	    this.update(_emitter4.default.sources.SILENT);
    	  }

    	  _createClass(Selection, [{
    	    key: 'handleComposition',
    	    value: function handleComposition() {
    	      var _this2 = this;

    	      this.root.addEventListener('compositionstart', function () {
    	        _this2.composing = true;
    	      });
    	      this.root.addEventListener('compositionend', function () {
    	        _this2.composing = false;
    	        if (_this2.cursor.parent) {
    	          var range = _this2.cursor.restore();
    	          if (!range) return;
    	          setTimeout(function () {
    	            _this2.setNativeRange(range.startNode, range.startOffset, range.endNode, range.endOffset);
    	          }, 1);
    	        }
    	      });
    	    }
    	  }, {
    	    key: 'handleDragging',
    	    value: function handleDragging() {
    	      var _this3 = this;

    	      this.emitter.listenDOM('mousedown', document.body, function () {
    	        _this3.mouseDown = true;
    	      });
    	      this.emitter.listenDOM('mouseup', document.body, function () {
    	        _this3.mouseDown = false;
    	        _this3.update(_emitter4.default.sources.USER);
    	      });
    	    }
    	  }, {
    	    key: 'focus',
    	    value: function focus() {
    	      if (this.hasFocus()) return;
    	      this.root.focus();
    	      this.setRange(this.savedRange);
    	    }
    	  }, {
    	    key: 'format',
    	    value: function format(_format, value) {
    	      if (this.scroll.whitelist != null && !this.scroll.whitelist[_format]) return;
    	      this.scroll.update();
    	      var nativeRange = this.getNativeRange();
    	      if (nativeRange == null || !nativeRange.native.collapsed || _parchment2.default.query(_format, _parchment2.default.Scope.BLOCK)) return;
    	      if (nativeRange.start.node !== this.cursor.textNode) {
    	        var blot = _parchment2.default.find(nativeRange.start.node, false);
    	        if (blot == null) return;
    	        // TODO Give blot ability to not split
    	        if (blot instanceof _parchment2.default.Leaf) {
    	          var after = blot.split(nativeRange.start.offset);
    	          blot.parent.insertBefore(this.cursor, after);
    	        } else {
    	          blot.insertBefore(this.cursor, nativeRange.start.node); // Should never happen
    	        }
    	        this.cursor.attach();
    	      }
    	      this.cursor.format(_format, value);
    	      this.scroll.optimize();
    	      this.setNativeRange(this.cursor.textNode, this.cursor.textNode.data.length);
    	      this.update();
    	    }
    	  }, {
    	    key: 'getBounds',
    	    value: function getBounds(index) {
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    	      var scrollLength = this.scroll.length();
    	      index = Math.min(index, scrollLength - 1);
    	      length = Math.min(index + length, scrollLength - 1) - index;
    	      var node = void 0,
    	          _scroll$leaf = this.scroll.leaf(index),
    	          _scroll$leaf2 = _slicedToArray(_scroll$leaf, 2),
    	          leaf = _scroll$leaf2[0],
    	          offset = _scroll$leaf2[1];
    	      if (leaf == null) return null;

    	      var _leaf$position = leaf.position(offset, true);

    	      var _leaf$position2 = _slicedToArray(_leaf$position, 2);

    	      node = _leaf$position2[0];
    	      offset = _leaf$position2[1];

    	      var range = document.createRange();
    	      if (length > 0) {
    	        range.setStart(node, offset);

    	        var _scroll$leaf3 = this.scroll.leaf(index + length);

    	        var _scroll$leaf4 = _slicedToArray(_scroll$leaf3, 2);

    	        leaf = _scroll$leaf4[0];
    	        offset = _scroll$leaf4[1];

    	        if (leaf == null) return null;

    	        var _leaf$position3 = leaf.position(offset, true);

    	        var _leaf$position4 = _slicedToArray(_leaf$position3, 2);

    	        node = _leaf$position4[0];
    	        offset = _leaf$position4[1];

    	        range.setEnd(node, offset);
    	        return range.getBoundingClientRect();
    	      } else {
    	        var side = 'left';
    	        var rect = void 0;
    	        if (node instanceof Text) {
    	          if (offset < node.data.length) {
    	            range.setStart(node, offset);
    	            range.setEnd(node, offset + 1);
    	          } else {
    	            range.setStart(node, offset - 1);
    	            range.setEnd(node, offset);
    	            side = 'right';
    	          }
    	          rect = range.getBoundingClientRect();
    	        } else {
    	          rect = leaf.domNode.getBoundingClientRect();
    	          if (offset > 0) side = 'right';
    	        }
    	        return {
    	          bottom: rect.top + rect.height,
    	          height: rect.height,
    	          left: rect[side],
    	          right: rect[side],
    	          top: rect.top,
    	          width: 0
    	        };
    	      }
    	    }
    	  }, {
    	    key: 'getNativeRange',
    	    value: function getNativeRange() {
    	      var selection = document.getSelection();
    	      if (selection == null || selection.rangeCount <= 0) return null;
    	      var nativeRange = selection.getRangeAt(0);
    	      if (nativeRange == null) return null;
    	      var range = this.normalizeNative(nativeRange);
    	      debug.info('getNativeRange', range);
    	      return range;
    	    }
    	  }, {
    	    key: 'getRange',
    	    value: function getRange() {
    	      var normalized = this.getNativeRange();
    	      if (normalized == null) return [null, null];
    	      var range = this.normalizedToRange(normalized);
    	      return [range, normalized];
    	    }
    	  }, {
    	    key: 'hasFocus',
    	    value: function hasFocus() {
    	      return document.activeElement === this.root;
    	    }
    	  }, {
    	    key: 'normalizedToRange',
    	    value: function normalizedToRange(range) {
    	      var _this4 = this;

    	      var positions = [[range.start.node, range.start.offset]];
    	      if (!range.native.collapsed) {
    	        positions.push([range.end.node, range.end.offset]);
    	      }
    	      var indexes = positions.map(function (position) {
    	        var _position = _slicedToArray(position, 2),
    	            node = _position[0],
    	            offset = _position[1];

    	        var blot = _parchment2.default.find(node, true);
    	        var index = blot.offset(_this4.scroll);
    	        if (offset === 0) {
    	          return index;
    	        } else if (blot instanceof _parchment2.default.Container) {
    	          return index + blot.length();
    	        } else {
    	          return index + blot.index(node, offset);
    	        }
    	      });
    	      var end = Math.min(Math.max.apply(Math, _toConsumableArray(indexes)), this.scroll.length() - 1);
    	      var start = Math.min.apply(Math, [end].concat(_toConsumableArray(indexes)));
    	      return new Range(start, end - start);
    	    }
    	  }, {
    	    key: 'normalizeNative',
    	    value: function normalizeNative(nativeRange) {
    	      if (!contains(this.root, nativeRange.startContainer) || !nativeRange.collapsed && !contains(this.root, nativeRange.endContainer)) {
    	        return null;
    	      }
    	      var range = {
    	        start: { node: nativeRange.startContainer, offset: nativeRange.startOffset },
    	        end: { node: nativeRange.endContainer, offset: nativeRange.endOffset },
    	        native: nativeRange
    	      };
    	      [range.start, range.end].forEach(function (position) {
    	        var node = position.node,
    	            offset = position.offset;
    	        while (!(node instanceof Text) && node.childNodes.length > 0) {
    	          if (node.childNodes.length > offset) {
    	            node = node.childNodes[offset];
    	            offset = 0;
    	          } else if (node.childNodes.length === offset) {
    	            node = node.lastChild;
    	            offset = node instanceof Text ? node.data.length : node.childNodes.length + 1;
    	          } else {
    	            break;
    	          }
    	        }
    	        position.node = node, position.offset = offset;
    	      });
    	      return range;
    	    }
    	  }, {
    	    key: 'rangeToNative',
    	    value: function rangeToNative(range) {
    	      var _this5 = this;

    	      var indexes = range.collapsed ? [range.index] : [range.index, range.index + range.length];
    	      var args = [];
    	      var scrollLength = this.scroll.length();
    	      indexes.forEach(function (index, i) {
    	        index = Math.min(scrollLength - 1, index);
    	        var node = void 0,
    	            _scroll$leaf5 = _this5.scroll.leaf(index),
    	            _scroll$leaf6 = _slicedToArray(_scroll$leaf5, 2),
    	            leaf = _scroll$leaf6[0],
    	            offset = _scroll$leaf6[1];
    	        var _leaf$position5 = leaf.position(offset, i !== 0);

    	        var _leaf$position6 = _slicedToArray(_leaf$position5, 2);

    	        node = _leaf$position6[0];
    	        offset = _leaf$position6[1];

    	        args.push(node, offset);
    	      });
    	      if (args.length < 2) {
    	        args = args.concat(args);
    	      }
    	      return args;
    	    }
    	  }, {
    	    key: 'scrollIntoView',
    	    value: function scrollIntoView(scrollingContainer) {
    	      var range = this.lastRange;
    	      if (range == null) return;
    	      var bounds = this.getBounds(range.index, range.length);
    	      if (bounds == null) return;
    	      var limit = this.scroll.length() - 1;

    	      var _scroll$line = this.scroll.line(Math.min(range.index, limit)),
    	          _scroll$line2 = _slicedToArray(_scroll$line, 1),
    	          first = _scroll$line2[0];

    	      var last = first;
    	      if (range.length > 0) {
    	        var _scroll$line3 = this.scroll.line(Math.min(range.index + range.length, limit));

    	        var _scroll$line4 = _slicedToArray(_scroll$line3, 1);

    	        last = _scroll$line4[0];
    	      }
    	      if (first == null || last == null) return;
    	      var scrollBounds = scrollingContainer.getBoundingClientRect();
    	      if (bounds.top < scrollBounds.top) {
    	        scrollingContainer.scrollTop -= scrollBounds.top - bounds.top;
    	      } else if (bounds.bottom > scrollBounds.bottom) {
    	        scrollingContainer.scrollTop += bounds.bottom - scrollBounds.bottom;
    	      }
    	    }
    	  }, {
    	    key: 'setNativeRange',
    	    value: function setNativeRange(startNode, startOffset) {
    	      var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : startNode;
    	      var endOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : startOffset;
    	      var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    	      debug.info('setNativeRange', startNode, startOffset, endNode, endOffset);
    	      if (startNode != null && (this.root.parentNode == null || startNode.parentNode == null || endNode.parentNode == null)) {
    	        return;
    	      }
    	      var selection = document.getSelection();
    	      if (selection == null) return;
    	      if (startNode != null) {
    	        if (!this.hasFocus()) this.root.focus();
    	        var native = (this.getNativeRange() || {}).native;
    	        if (native == null || force || startNode !== native.startContainer || startOffset !== native.startOffset || endNode !== native.endContainer || endOffset !== native.endOffset) {

    	          if (startNode.tagName == "BR") {
    	            startOffset = [].indexOf.call(startNode.parentNode.childNodes, startNode);
    	            startNode = startNode.parentNode;
    	          }
    	          if (endNode.tagName == "BR") {
    	            endOffset = [].indexOf.call(endNode.parentNode.childNodes, endNode);
    	            endNode = endNode.parentNode;
    	          }
    	          var range = document.createRange();
    	          range.setStart(startNode, startOffset);
    	          range.setEnd(endNode, endOffset);
    	          selection.removeAllRanges();
    	          selection.addRange(range);
    	        }
    	      } else {
    	        selection.removeAllRanges();
    	        this.root.blur();
    	        document.body.focus(); // root.blur() not enough on IE11+Travis+SauceLabs (but not local VMs)
    	      }
    	    }
    	  }, {
    	    key: 'setRange',
    	    value: function setRange(range) {
    	      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    	      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

    	      if (typeof force === 'string') {
    	        source = force;
    	        force = false;
    	      }
    	      debug.info('setRange', range);
    	      if (range != null) {
    	        var args = this.rangeToNative(range);
    	        this.setNativeRange.apply(this, _toConsumableArray(args).concat([force]));
    	      } else {
    	        this.setNativeRange(null);
    	      }
    	      this.update(source);
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update() {
    	      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

    	      var oldRange = this.lastRange;

    	      var _getRange = this.getRange(),
    	          _getRange2 = _slicedToArray(_getRange, 2),
    	          lastRange = _getRange2[0],
    	          nativeRange = _getRange2[1];

    	      this.lastRange = lastRange;
    	      if (this.lastRange != null) {
    	        this.savedRange = this.lastRange;
    	      }
    	      if (!(0, _deepEqual2.default)(oldRange, this.lastRange)) {
    	        var _emitter;

    	        if (!this.composing && nativeRange != null && nativeRange.native.collapsed && nativeRange.start.node !== this.cursor.textNode) {
    	          this.cursor.restore();
    	        }
    	        var args = [_emitter4.default.events.SELECTION_CHANGE, (0, _clone2.default)(this.lastRange), (0, _clone2.default)(oldRange), source];
    	        (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
    	        if (source !== _emitter4.default.sources.SILENT) {
    	          var _emitter2;

    	          (_emitter2 = this.emitter).emit.apply(_emitter2, args);
    	        }
    	      }
    	    }
    	  }]);

    	  return Selection;
    	}();

    	function contains(parent, descendant) {
    	  try {
    	    // Firefox inserts inaccessible nodes around video elements
    	    descendant.parentNode;
    	  } catch (e) {
    	    return false;
    	  }
    	  // IE11 has bug with Text nodes
    	  // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
    	  if (descendant instanceof Text) {
    	    descendant = descendant.parentNode;
    	  }
    	  return parent.contains(descendant);
    	}

    	exports.Range = Range;
    	exports.default = Selection;

    	/***/ }),
    	/* 16 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Break = function (_Parchment$Embed) {
    	  _inherits(Break, _Parchment$Embed);

    	  function Break() {
    	    _classCallCheck(this, Break);

    	    return _possibleConstructorReturn(this, (Break.__proto__ || Object.getPrototypeOf(Break)).apply(this, arguments));
    	  }

    	  _createClass(Break, [{
    	    key: 'insertInto',
    	    value: function insertInto(parent, ref) {
    	      if (parent.children.length === 0) {
    	        _get(Break.prototype.__proto__ || Object.getPrototypeOf(Break.prototype), 'insertInto', this).call(this, parent, ref);
    	      } else {
    	        this.remove();
    	      }
    	    }
    	  }, {
    	    key: 'length',
    	    value: function length() {
    	      return 0;
    	    }
    	  }, {
    	    key: 'value',
    	    value: function value() {
    	      return '';
    	    }
    	  }], [{
    	    key: 'value',
    	    value: function value() {
    	      return undefined;
    	    }
    	  }]);

    	  return Break;
    	}(_parchment2.default.Embed);

    	Break.blotName = 'break';
    	Break.tagName = 'BR';

    	exports.default = Break;

    	/***/ }),
    	/* 17 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var linked_list_1 = __webpack_require__(44);
    	var shadow_1 = __webpack_require__(30);
    	var Registry = __webpack_require__(1);
    	var ContainerBlot = /** @class */ (function (_super) {
    	    __extends(ContainerBlot, _super);
    	    function ContainerBlot(domNode) {
    	        var _this = _super.call(this, domNode) || this;
    	        _this.build();
    	        return _this;
    	    }
    	    ContainerBlot.prototype.appendChild = function (other) {
    	        this.insertBefore(other);
    	    };
    	    ContainerBlot.prototype.attach = function () {
    	        _super.prototype.attach.call(this);
    	        this.children.forEach(function (child) {
    	            child.attach();
    	        });
    	    };
    	    ContainerBlot.prototype.build = function () {
    	        var _this = this;
    	        this.children = new linked_list_1.default();
    	        // Need to be reversed for if DOM nodes already in order
    	        [].slice
    	            .call(this.domNode.childNodes)
    	            .reverse()
    	            .forEach(function (node) {
    	            try {
    	                var child = makeBlot(node);
    	                _this.insertBefore(child, _this.children.head || undefined);
    	            }
    	            catch (err) {
    	                if (err instanceof Registry.ParchmentError)
    	                    return;
    	                else
    	                    throw err;
    	            }
    	        });
    	    };
    	    ContainerBlot.prototype.deleteAt = function (index, length) {
    	        if (index === 0 && length === this.length()) {
    	            return this.remove();
    	        }
    	        this.children.forEachAt(index, length, function (child, offset, length) {
    	            child.deleteAt(offset, length);
    	        });
    	    };
    	    ContainerBlot.prototype.descendant = function (criteria, index) {
    	        var _a = this.children.find(index), child = _a[0], offset = _a[1];
    	        if ((criteria.blotName == null && criteria(child)) ||
    	            (criteria.blotName != null && child instanceof criteria)) {
    	            return [child, offset];
    	        }
    	        else if (child instanceof ContainerBlot) {
    	            return child.descendant(criteria, offset);
    	        }
    	        else {
    	            return [null, -1];
    	        }
    	    };
    	    ContainerBlot.prototype.descendants = function (criteria, index, length) {
    	        if (index === void 0) { index = 0; }
    	        if (length === void 0) { length = Number.MAX_VALUE; }
    	        var descendants = [];
    	        var lengthLeft = length;
    	        this.children.forEachAt(index, length, function (child, index, length) {
    	            if ((criteria.blotName == null && criteria(child)) ||
    	                (criteria.blotName != null && child instanceof criteria)) {
    	                descendants.push(child);
    	            }
    	            if (child instanceof ContainerBlot) {
    	                descendants = descendants.concat(child.descendants(criteria, index, lengthLeft));
    	            }
    	            lengthLeft -= length;
    	        });
    	        return descendants;
    	    };
    	    ContainerBlot.prototype.detach = function () {
    	        this.children.forEach(function (child) {
    	            child.detach();
    	        });
    	        _super.prototype.detach.call(this);
    	    };
    	    ContainerBlot.prototype.formatAt = function (index, length, name, value) {
    	        this.children.forEachAt(index, length, function (child, offset, length) {
    	            child.formatAt(offset, length, name, value);
    	        });
    	    };
    	    ContainerBlot.prototype.insertAt = function (index, value, def) {
    	        var _a = this.children.find(index), child = _a[0], offset = _a[1];
    	        if (child) {
    	            child.insertAt(offset, value, def);
    	        }
    	        else {
    	            var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
    	            this.appendChild(blot);
    	        }
    	    };
    	    ContainerBlot.prototype.insertBefore = function (childBlot, refBlot) {
    	        if (this.statics.allowedChildren != null &&
    	            !this.statics.allowedChildren.some(function (child) {
    	                return childBlot instanceof child;
    	            })) {
    	            throw new Registry.ParchmentError("Cannot insert " + childBlot.statics.blotName + " into " + this.statics.blotName);
    	        }
    	        childBlot.insertInto(this, refBlot);
    	    };
    	    ContainerBlot.prototype.length = function () {
    	        return this.children.reduce(function (memo, child) {
    	            return memo + child.length();
    	        }, 0);
    	    };
    	    ContainerBlot.prototype.moveChildren = function (targetParent, refNode) {
    	        this.children.forEach(function (child) {
    	            targetParent.insertBefore(child, refNode);
    	        });
    	    };
    	    ContainerBlot.prototype.optimize = function (context) {
    	        _super.prototype.optimize.call(this, context);
    	        if (this.children.length === 0) {
    	            if (this.statics.defaultChild != null) {
    	                var child = Registry.create(this.statics.defaultChild);
    	                this.appendChild(child);
    	                child.optimize(context);
    	            }
    	            else {
    	                this.remove();
    	            }
    	        }
    	    };
    	    ContainerBlot.prototype.path = function (index, inclusive) {
    	        if (inclusive === void 0) { inclusive = false; }
    	        var _a = this.children.find(index, inclusive), child = _a[0], offset = _a[1];
    	        var position = [[this, index]];
    	        if (child instanceof ContainerBlot) {
    	            return position.concat(child.path(offset, inclusive));
    	        }
    	        else if (child != null) {
    	            position.push([child, offset]);
    	        }
    	        return position;
    	    };
    	    ContainerBlot.prototype.removeChild = function (child) {
    	        this.children.remove(child);
    	    };
    	    ContainerBlot.prototype.replace = function (target) {
    	        if (target instanceof ContainerBlot) {
    	            target.moveChildren(this);
    	        }
    	        _super.prototype.replace.call(this, target);
    	    };
    	    ContainerBlot.prototype.split = function (index, force) {
    	        if (force === void 0) { force = false; }
    	        if (!force) {
    	            if (index === 0)
    	                return this;
    	            if (index === this.length())
    	                return this.next;
    	        }
    	        var after = this.clone();
    	        this.parent.insertBefore(after, this.next);
    	        this.children.forEachAt(index, this.length(), function (child, offset, length) {
    	            child = child.split(offset, force);
    	            after.appendChild(child);
    	        });
    	        return after;
    	    };
    	    ContainerBlot.prototype.unwrap = function () {
    	        this.moveChildren(this.parent, this.next);
    	        this.remove();
    	    };
    	    ContainerBlot.prototype.update = function (mutations, context) {
    	        var _this = this;
    	        var addedNodes = [];
    	        var removedNodes = [];
    	        mutations.forEach(function (mutation) {
    	            if (mutation.target === _this.domNode && mutation.type === 'childList') {
    	                addedNodes.push.apply(addedNodes, mutation.addedNodes);
    	                removedNodes.push.apply(removedNodes, mutation.removedNodes);
    	            }
    	        });
    	        removedNodes.forEach(function (node) {
    	            // Check node has actually been removed
    	            // One exception is Chrome does not immediately remove IFRAMEs
    	            // from DOM but MutationRecord is correct in its reported removal
    	            if (node.parentNode != null &&
    	                // @ts-ignore
    	                node.tagName !== 'IFRAME' &&
    	                document.body.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    	                return;
    	            }
    	            var blot = Registry.find(node);
    	            if (blot == null)
    	                return;
    	            if (blot.domNode.parentNode == null || blot.domNode.parentNode === _this.domNode) {
    	                blot.detach();
    	            }
    	        });
    	        addedNodes
    	            .filter(function (node) {
    	            return node.parentNode == _this.domNode;
    	        })
    	            .sort(function (a, b) {
    	            if (a === b)
    	                return 0;
    	            if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
    	                return 1;
    	            }
    	            return -1;
    	        })
    	            .forEach(function (node) {
    	            var refBlot = null;
    	            if (node.nextSibling != null) {
    	                refBlot = Registry.find(node.nextSibling);
    	            }
    	            var blot = makeBlot(node);
    	            if (blot.next != refBlot || blot.next == null) {
    	                if (blot.parent != null) {
    	                    blot.parent.removeChild(_this);
    	                }
    	                _this.insertBefore(blot, refBlot || undefined);
    	            }
    	        });
    	    };
    	    return ContainerBlot;
    	}(shadow_1.default));
    	function makeBlot(node) {
    	    var blot = Registry.find(node);
    	    if (blot == null) {
    	        try {
    	            blot = Registry.create(node);
    	        }
    	        catch (e) {
    	            blot = Registry.create(Registry.Scope.INLINE);
    	            [].slice.call(node.childNodes).forEach(function (child) {
    	                // @ts-ignore
    	                blot.domNode.appendChild(child);
    	            });
    	            if (node.parentNode) {
    	                node.parentNode.replaceChild(blot.domNode, node);
    	            }
    	            blot.attach();
    	        }
    	    }
    	    return blot;
    	}
    	exports.default = ContainerBlot;


    	/***/ }),
    	/* 18 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var attributor_1 = __webpack_require__(12);
    	var store_1 = __webpack_require__(31);
    	var container_1 = __webpack_require__(17);
    	var Registry = __webpack_require__(1);
    	var FormatBlot = /** @class */ (function (_super) {
    	    __extends(FormatBlot, _super);
    	    function FormatBlot(domNode) {
    	        var _this = _super.call(this, domNode) || this;
    	        _this.attributes = new store_1.default(_this.domNode);
    	        return _this;
    	    }
    	    FormatBlot.formats = function (domNode) {
    	        if (typeof this.tagName === 'string') {
    	            return true;
    	        }
    	        else if (Array.isArray(this.tagName)) {
    	            return domNode.tagName.toLowerCase();
    	        }
    	        return undefined;
    	    };
    	    FormatBlot.prototype.format = function (name, value) {
    	        var format = Registry.query(name);
    	        if (format instanceof attributor_1.default) {
    	            this.attributes.attribute(format, value);
    	        }
    	        else if (value) {
    	            if (format != null && (name !== this.statics.blotName || this.formats()[name] !== value)) {
    	                this.replaceWith(name, value);
    	            }
    	        }
    	    };
    	    FormatBlot.prototype.formats = function () {
    	        var formats = this.attributes.values();
    	        var format = this.statics.formats(this.domNode);
    	        if (format != null) {
    	            formats[this.statics.blotName] = format;
    	        }
    	        return formats;
    	    };
    	    FormatBlot.prototype.replaceWith = function (name, value) {
    	        var replacement = _super.prototype.replaceWith.call(this, name, value);
    	        this.attributes.copy(replacement);
    	        return replacement;
    	    };
    	    FormatBlot.prototype.update = function (mutations, context) {
    	        var _this = this;
    	        _super.prototype.update.call(this, mutations, context);
    	        if (mutations.some(function (mutation) {
    	            return mutation.target === _this.domNode && mutation.type === 'attributes';
    	        })) {
    	            this.attributes.build();
    	        }
    	    };
    	    FormatBlot.prototype.wrap = function (name, value) {
    	        var wrapper = _super.prototype.wrap.call(this, name, value);
    	        if (wrapper instanceof FormatBlot && wrapper.statics.scope === this.statics.scope) {
    	            this.attributes.move(wrapper);
    	        }
    	        return wrapper;
    	    };
    	    return FormatBlot;
    	}(container_1.default));
    	exports.default = FormatBlot;


    	/***/ }),
    	/* 19 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var shadow_1 = __webpack_require__(30);
    	var Registry = __webpack_require__(1);
    	var LeafBlot = /** @class */ (function (_super) {
    	    __extends(LeafBlot, _super);
    	    function LeafBlot() {
    	        return _super !== null && _super.apply(this, arguments) || this;
    	    }
    	    LeafBlot.value = function (domNode) {
    	        return true;
    	    };
    	    LeafBlot.prototype.index = function (node, offset) {
    	        if (this.domNode === node ||
    	            this.domNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    	            return Math.min(offset, 1);
    	        }
    	        return -1;
    	    };
    	    LeafBlot.prototype.position = function (index, inclusive) {
    	        var offset = [].indexOf.call(this.parent.domNode.childNodes, this.domNode);
    	        if (index > 0)
    	            offset += 1;
    	        return [this.parent.domNode, offset];
    	    };
    	    LeafBlot.prototype.value = function () {
    	        var _a;
    	        return _a = {}, _a[this.statics.blotName] = this.statics.value(this.domNode) || true, _a;
    	    };
    	    LeafBlot.scope = Registry.Scope.INLINE_BLOT;
    	    return LeafBlot;
    	}(shadow_1.default));
    	exports.default = LeafBlot;


    	/***/ }),
    	/* 20 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var equal = __webpack_require__(11);
    	var extend = __webpack_require__(3);


    	var lib = {
    	  attributes: {
    	    compose: function (a, b, keepNull) {
    	      if (typeof a !== 'object') a = {};
    	      if (typeof b !== 'object') b = {};
    	      var attributes = extend(true, {}, b);
    	      if (!keepNull) {
    	        attributes = Object.keys(attributes).reduce(function (copy, key) {
    	          if (attributes[key] != null) {
    	            copy[key] = attributes[key];
    	          }
    	          return copy;
    	        }, {});
    	      }
    	      for (var key in a) {
    	        if (a[key] !== undefined && b[key] === undefined) {
    	          attributes[key] = a[key];
    	        }
    	      }
    	      return Object.keys(attributes).length > 0 ? attributes : undefined;
    	    },

    	    diff: function(a, b) {
    	      if (typeof a !== 'object') a = {};
    	      if (typeof b !== 'object') b = {};
    	      var attributes = Object.keys(a).concat(Object.keys(b)).reduce(function (attributes, key) {
    	        if (!equal(a[key], b[key])) {
    	          attributes[key] = b[key] === undefined ? null : b[key];
    	        }
    	        return attributes;
    	      }, {});
    	      return Object.keys(attributes).length > 0 ? attributes : undefined;
    	    },

    	    transform: function (a, b, priority) {
    	      if (typeof a !== 'object') return b;
    	      if (typeof b !== 'object') return undefined;
    	      if (!priority) return b;  // b simply overwrites us without priority
    	      var attributes = Object.keys(b).reduce(function (attributes, key) {
    	        if (a[key] === undefined) attributes[key] = b[key];  // null is a valid value
    	        return attributes;
    	      }, {});
    	      return Object.keys(attributes).length > 0 ? attributes : undefined;
    	    }
    	  },

    	  iterator: function (ops) {
    	    return new Iterator(ops);
    	  },

    	  length: function (op) {
    	    if (typeof op['delete'] === 'number') {
    	      return op['delete'];
    	    } else if (typeof op.retain === 'number') {
    	      return op.retain;
    	    } else {
    	      return typeof op.insert === 'string' ? op.insert.length : 1;
    	    }
    	  }
    	};


    	function Iterator(ops) {
    	  this.ops = ops;
    	  this.index = 0;
    	  this.offset = 0;
    	}
    	Iterator.prototype.hasNext = function () {
    	  return this.peekLength() < Infinity;
    	};

    	Iterator.prototype.next = function (length) {
    	  if (!length) length = Infinity;
    	  var nextOp = this.ops[this.index];
    	  if (nextOp) {
    	    var offset = this.offset;
    	    var opLength = lib.length(nextOp);
    	    if (length >= opLength - offset) {
    	      length = opLength - offset;
    	      this.index += 1;
    	      this.offset = 0;
    	    } else {
    	      this.offset += length;
    	    }
    	    if (typeof nextOp['delete'] === 'number') {
    	      return { 'delete': length };
    	    } else {
    	      var retOp = {};
    	      if (nextOp.attributes) {
    	        retOp.attributes = nextOp.attributes;
    	      }
    	      if (typeof nextOp.retain === 'number') {
    	        retOp.retain = length;
    	      } else if (typeof nextOp.insert === 'string') {
    	        retOp.insert = nextOp.insert.substr(offset, length);
    	      } else {
    	        // offset should === 0, length should === 1
    	        retOp.insert = nextOp.insert;
    	      }
    	      return retOp;
    	    }
    	  } else {
    	    return { retain: Infinity };
    	  }
    	};

    	Iterator.prototype.peek = function () {
    	  return this.ops[this.index];
    	};

    	Iterator.prototype.peekLength = function () {
    	  if (this.ops[this.index]) {
    	    // Should never return 0 if our index is being managed correctly
    	    return lib.length(this.ops[this.index]) - this.offset;
    	  } else {
    	    return Infinity;
    	  }
    	};

    	Iterator.prototype.peekType = function () {
    	  if (this.ops[this.index]) {
    	    if (typeof this.ops[this.index]['delete'] === 'number') {
    	      return 'delete';
    	    } else if (typeof this.ops[this.index].retain === 'number') {
    	      return 'retain';
    	    } else {
    	      return 'insert';
    	    }
    	  }
    	  return 'retain';
    	};

    	Iterator.prototype.rest = function () {
    	  if (!this.hasNext()) {
    	    return [];
    	  } else if (this.offset === 0) {
    	    return this.ops.slice(this.index);
    	  } else {
    	    var offset = this.offset;
    	    var index = this.index;
    	    var next = this.next();
    	    var rest = this.ops.slice(this.index);
    	    this.offset = offset;
    	    this.index = index;
    	    return [next].concat(rest);
    	  }
    	};


    	module.exports = lib;


    	/***/ }),
    	/* 21 */
    	/***/ (function(module, exports) {

    	var clone = (function() {

    	function _instanceof(obj, type) {
    	  return type != null && obj instanceof type;
    	}

    	var nativeMap;
    	try {
    	  nativeMap = Map;
    	} catch(_) {
    	  // maybe a reference error because no `Map`. Give it a dummy value that no
    	  // value will ever be an instanceof.
    	  nativeMap = function() {};
    	}

    	var nativeSet;
    	try {
    	  nativeSet = Set;
    	} catch(_) {
    	  nativeSet = function() {};
    	}

    	var nativePromise;
    	try {
    	  nativePromise = Promise;
    	} catch(_) {
    	  nativePromise = function() {};
    	}

    	/**
    	 * Clones (copies) an Object using deep copying.
    	 *
    	 * This function supports circular references by default, but if you are certain
    	 * there are no circular references in your object, you can save some CPU time
    	 * by calling clone(obj, false).
    	 *
    	 * Caution: if `circular` is false and `parent` contains circular references,
    	 * your program may enter an infinite loop and crash.
    	 *
    	 * @param `parent` - the object to be cloned
    	 * @param `circular` - set to true if the object to be cloned may contain
    	 *    circular references. (optional - true by default)
    	 * @param `depth` - set to a number if the object is only to be cloned to
    	 *    a particular depth. (optional - defaults to Infinity)
    	 * @param `prototype` - sets the prototype to be used when cloning an object.
    	 *    (optional - defaults to parent prototype).
    	 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
    	 *    should be cloned as well. Non-enumerable properties on the prototype
    	 *    chain will be ignored. (optional - false by default)
    	*/
    	function clone(parent, circular, depth, prototype, includeNonEnumerable) {
    	  if (typeof circular === 'object') {
    	    depth = circular.depth;
    	    prototype = circular.prototype;
    	    includeNonEnumerable = circular.includeNonEnumerable;
    	    circular = circular.circular;
    	  }
    	  // maintain two arrays for circular references, where corresponding parents
    	  // and children have the same index
    	  var allParents = [];
    	  var allChildren = [];

    	  var useBuffer = typeof Buffer != 'undefined';

    	  if (typeof circular == 'undefined')
    	    circular = true;

    	  if (typeof depth == 'undefined')
    	    depth = Infinity;

    	  // recurse this function so we don't reset allParents and allChildren
    	  function _clone(parent, depth) {
    	    // cloning null always returns null
    	    if (parent === null)
    	      return null;

    	    if (depth === 0)
    	      return parent;

    	    var child;
    	    var proto;
    	    if (typeof parent != 'object') {
    	      return parent;
    	    }

    	    if (_instanceof(parent, nativeMap)) {
    	      child = new nativeMap();
    	    } else if (_instanceof(parent, nativeSet)) {
    	      child = new nativeSet();
    	    } else if (_instanceof(parent, nativePromise)) {
    	      child = new nativePromise(function (resolve, reject) {
    	        parent.then(function(value) {
    	          resolve(_clone(value, depth - 1));
    	        }, function(err) {
    	          reject(_clone(err, depth - 1));
    	        });
    	      });
    	    } else if (clone.__isArray(parent)) {
    	      child = [];
    	    } else if (clone.__isRegExp(parent)) {
    	      child = new RegExp(parent.source, __getRegExpFlags(parent));
    	      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    	    } else if (clone.__isDate(parent)) {
    	      child = new Date(parent.getTime());
    	    } else if (useBuffer && Buffer.isBuffer(parent)) {
    	      if (Buffer.allocUnsafe) {
    	        // Node.js >= 4.5.0
    	        child = Buffer.allocUnsafe(parent.length);
    	      } else {
    	        // Older Node.js versions
    	        child = new Buffer(parent.length);
    	      }
    	      parent.copy(child);
    	      return child;
    	    } else if (_instanceof(parent, Error)) {
    	      child = Object.create(parent);
    	    } else {
    	      if (typeof prototype == 'undefined') {
    	        proto = Object.getPrototypeOf(parent);
    	        child = Object.create(proto);
    	      }
    	      else {
    	        child = Object.create(prototype);
    	        proto = prototype;
    	      }
    	    }

    	    if (circular) {
    	      var index = allParents.indexOf(parent);

    	      if (index != -1) {
    	        return allChildren[index];
    	      }
    	      allParents.push(parent);
    	      allChildren.push(child);
    	    }

    	    if (_instanceof(parent, nativeMap)) {
    	      parent.forEach(function(value, key) {
    	        var keyChild = _clone(key, depth - 1);
    	        var valueChild = _clone(value, depth - 1);
    	        child.set(keyChild, valueChild);
    	      });
    	    }
    	    if (_instanceof(parent, nativeSet)) {
    	      parent.forEach(function(value) {
    	        var entryChild = _clone(value, depth - 1);
    	        child.add(entryChild);
    	      });
    	    }

    	    for (var i in parent) {
    	      var attrs;
    	      if (proto) {
    	        attrs = Object.getOwnPropertyDescriptor(proto, i);
    	      }

    	      if (attrs && attrs.set == null) {
    	        continue;
    	      }
    	      child[i] = _clone(parent[i], depth - 1);
    	    }

    	    if (Object.getOwnPropertySymbols) {
    	      var symbols = Object.getOwnPropertySymbols(parent);
    	      for (var i = 0; i < symbols.length; i++) {
    	        // Don't need to worry about cloning a symbol because it is a primitive,
    	        // like a number or string.
    	        var symbol = symbols[i];
    	        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
    	        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
    	          continue;
    	        }
    	        child[symbol] = _clone(parent[symbol], depth - 1);
    	        if (!descriptor.enumerable) {
    	          Object.defineProperty(child, symbol, {
    	            enumerable: false
    	          });
    	        }
    	      }
    	    }

    	    if (includeNonEnumerable) {
    	      var allPropertyNames = Object.getOwnPropertyNames(parent);
    	      for (var i = 0; i < allPropertyNames.length; i++) {
    	        var propertyName = allPropertyNames[i];
    	        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
    	        if (descriptor && descriptor.enumerable) {
    	          continue;
    	        }
    	        child[propertyName] = _clone(parent[propertyName], depth - 1);
    	        Object.defineProperty(child, propertyName, {
    	          enumerable: false
    	        });
    	      }
    	    }

    	    return child;
    	  }

    	  return _clone(parent, depth);
    	}

    	/**
    	 * Simple flat clone using prototype, accepts only objects, usefull for property
    	 * override on FLAT configuration object (no nested props).
    	 *
    	 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
    	 * works.
    	 */
    	clone.clonePrototype = function clonePrototype(parent) {
    	  if (parent === null)
    	    return null;

    	  var c = function () {};
    	  c.prototype = parent;
    	  return new c();
    	};

    	// private utility functions

    	function __objToStr(o) {
    	  return Object.prototype.toString.call(o);
    	}
    	clone.__objToStr = __objToStr;

    	function __isDate(o) {
    	  return typeof o === 'object' && __objToStr(o) === '[object Date]';
    	}
    	clone.__isDate = __isDate;

    	function __isArray(o) {
    	  return typeof o === 'object' && __objToStr(o) === '[object Array]';
    	}
    	clone.__isArray = __isArray;

    	function __isRegExp(o) {
    	  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
    	}
    	clone.__isRegExp = __isRegExp;

    	function __getRegExpFlags(re) {
    	  var flags = '';
    	  if (re.global) flags += 'g';
    	  if (re.ignoreCase) flags += 'i';
    	  if (re.multiline) flags += 'm';
    	  return flags;
    	}
    	clone.__getRegExpFlags = __getRegExpFlags;

    	return clone;
    	})();

    	if (typeof module === 'object' && module.exports) {
    	  module.exports = clone;
    	}


    	/***/ }),
    	/* 22 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _emitter = __webpack_require__(8);

    	var _emitter2 = _interopRequireDefault(_emitter);

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	var _break = __webpack_require__(16);

    	var _break2 = _interopRequireDefault(_break);

    	var _code = __webpack_require__(13);

    	var _code2 = _interopRequireDefault(_code);

    	var _container = __webpack_require__(25);

    	var _container2 = _interopRequireDefault(_container);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	function isLine(blot) {
    	  return blot instanceof _block2.default || blot instanceof _block.BlockEmbed;
    	}

    	var Scroll = function (_Parchment$Scroll) {
    	  _inherits(Scroll, _Parchment$Scroll);

    	  function Scroll(domNode, config) {
    	    _classCallCheck(this, Scroll);

    	    var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this, domNode));

    	    _this.emitter = config.emitter;
    	    if (Array.isArray(config.whitelist)) {
    	      _this.whitelist = config.whitelist.reduce(function (whitelist, format) {
    	        whitelist[format] = true;
    	        return whitelist;
    	      }, {});
    	    }
    	    // Some reason fixes composition issues with character languages in Windows/Chrome, Safari
    	    _this.domNode.addEventListener('DOMNodeInserted', function () {});
    	    _this.optimize();
    	    _this.enable();
    	    return _this;
    	  }

    	  _createClass(Scroll, [{
    	    key: 'batchStart',
    	    value: function batchStart() {
    	      this.batch = true;
    	    }
    	  }, {
    	    key: 'batchEnd',
    	    value: function batchEnd() {
    	      this.batch = false;
    	      this.optimize();
    	    }
    	  }, {
    	    key: 'deleteAt',
    	    value: function deleteAt(index, length) {
    	      var _line = this.line(index),
    	          _line2 = _slicedToArray(_line, 2),
    	          first = _line2[0],
    	          offset = _line2[1];

    	      var _line3 = this.line(index + length),
    	          _line4 = _slicedToArray(_line3, 1),
    	          last = _line4[0];

    	      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'deleteAt', this).call(this, index, length);
    	      if (last != null && first !== last && offset > 0) {
    	        if (first instanceof _block.BlockEmbed || last instanceof _block.BlockEmbed) {
    	          this.optimize();
    	          return;
    	        }
    	        if (first instanceof _code2.default) {
    	          var newlineIndex = first.newlineIndex(first.length(), true);
    	          if (newlineIndex > -1) {
    	            first = first.split(newlineIndex + 1);
    	            if (first === last) {
    	              this.optimize();
    	              return;
    	            }
    	          }
    	        } else if (last instanceof _code2.default) {
    	          var _newlineIndex = last.newlineIndex(0);
    	          if (_newlineIndex > -1) {
    	            last.split(_newlineIndex + 1);
    	          }
    	        }
    	        var ref = last.children.head instanceof _break2.default ? null : last.children.head;
    	        first.moveChildren(last, ref);
    	        first.remove();
    	      }
    	      this.optimize();
    	    }
    	  }, {
    	    key: 'enable',
    	    value: function enable() {
    	      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    	      this.domNode.setAttribute('contenteditable', enabled);
    	    }
    	  }, {
    	    key: 'formatAt',
    	    value: function formatAt(index, length, format, value) {
    	      if (this.whitelist != null && !this.whitelist[format]) return;
    	      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'formatAt', this).call(this, index, length, format, value);
    	      this.optimize();
    	    }
    	  }, {
    	    key: 'insertAt',
    	    value: function insertAt(index, value, def) {
    	      if (def != null && this.whitelist != null && !this.whitelist[value]) return;
    	      if (index >= this.length()) {
    	        if (def == null || _parchment2.default.query(value, _parchment2.default.Scope.BLOCK) == null) {
    	          var blot = _parchment2.default.create(this.statics.defaultChild);
    	          this.appendChild(blot);
    	          if (def == null && value.endsWith('\n')) {
    	            value = value.slice(0, -1);
    	          }
    	          blot.insertAt(0, value, def);
    	        } else {
    	          var embed = _parchment2.default.create(value, def);
    	          this.appendChild(embed);
    	        }
    	      } else {
    	        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertAt', this).call(this, index, value, def);
    	      }
    	      this.optimize();
    	    }
    	  }, {
    	    key: 'insertBefore',
    	    value: function insertBefore(blot, ref) {
    	      if (blot.statics.scope === _parchment2.default.Scope.INLINE_BLOT) {
    	        var wrapper = _parchment2.default.create(this.statics.defaultChild);
    	        wrapper.appendChild(blot);
    	        blot = wrapper;
    	      }
    	      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertBefore', this).call(this, blot, ref);
    	    }
    	  }, {
    	    key: 'leaf',
    	    value: function leaf(index) {
    	      return this.path(index).pop() || [null, -1];
    	    }
    	  }, {
    	    key: 'line',
    	    value: function line(index) {
    	      if (index === this.length()) {
    	        return this.line(index - 1);
    	      }
    	      return this.descendant(isLine, index);
    	    }
    	  }, {
    	    key: 'lines',
    	    value: function lines() {
    	      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    	      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

    	      var getLines = function getLines(blot, index, length) {
    	        var lines = [],
    	            lengthLeft = length;
    	        blot.children.forEachAt(index, length, function (child, index, length) {
    	          if (isLine(child)) {
    	            lines.push(child);
    	          } else if (child instanceof _parchment2.default.Container) {
    	            lines = lines.concat(getLines(child, index, lengthLeft));
    	          }
    	          lengthLeft -= length;
    	        });
    	        return lines;
    	      };
    	      return getLines(this, index, length);
    	    }
    	  }, {
    	    key: 'optimize',
    	    value: function optimize() {
    	      var mutations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    	      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    	      if (this.batch === true) return;
    	      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'optimize', this).call(this, mutations, context);
    	      if (mutations.length > 0) {
    	        this.emitter.emit(_emitter2.default.events.SCROLL_OPTIMIZE, mutations, context);
    	      }
    	    }
    	  }, {
    	    key: 'path',
    	    value: function path(index) {
    	      return _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'path', this).call(this, index).slice(1); // Exclude self
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update(mutations) {
    	      if (this.batch === true) return;
    	      var source = _emitter2.default.sources.USER;
    	      if (typeof mutations === 'string') {
    	        source = mutations;
    	      }
    	      if (!Array.isArray(mutations)) {
    	        mutations = this.observer.takeRecords();
    	      }
    	      if (mutations.length > 0) {
    	        this.emitter.emit(_emitter2.default.events.SCROLL_BEFORE_UPDATE, source, mutations);
    	      }
    	      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'update', this).call(this, mutations.concat([])); // pass copy
    	      if (mutations.length > 0) {
    	        this.emitter.emit(_emitter2.default.events.SCROLL_UPDATE, source, mutations);
    	      }
    	    }
    	  }]);

    	  return Scroll;
    	}(_parchment2.default.Scroll);

    	Scroll.blotName = 'scroll';
    	Scroll.className = 'ql-editor';
    	Scroll.tagName = 'DIV';
    	Scroll.defaultChild = 'block';
    	Scroll.allowedChildren = [_block2.default, _block.BlockEmbed, _container2.default];

    	exports.default = Scroll;

    	/***/ }),
    	/* 23 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.SHORTKEY = exports.default = undefined;

    	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _clone = __webpack_require__(21);

    	var _clone2 = _interopRequireDefault(_clone);

    	var _deepEqual = __webpack_require__(11);

    	var _deepEqual2 = _interopRequireDefault(_deepEqual);

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _op = __webpack_require__(20);

    	var _op2 = _interopRequireDefault(_op);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _logger = __webpack_require__(10);

    	var _logger2 = _interopRequireDefault(_logger);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var debug = (0, _logger2.default)('quill:keyboard');

    	var SHORTKEY = /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';

    	var Keyboard = function (_Module) {
    	  _inherits(Keyboard, _Module);

    	  _createClass(Keyboard, null, [{
    	    key: 'match',
    	    value: function match(evt, binding) {
    	      binding = normalize(binding);
    	      if (['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(function (key) {
    	        return !!binding[key] !== evt[key] && binding[key] !== null;
    	      })) {
    	        return false;
    	      }
    	      return binding.key === (evt.which || evt.keyCode);
    	    }
    	  }]);

    	  function Keyboard(quill, options) {
    	    _classCallCheck(this, Keyboard);

    	    var _this = _possibleConstructorReturn(this, (Keyboard.__proto__ || Object.getPrototypeOf(Keyboard)).call(this, quill, options));

    	    _this.bindings = {};
    	    Object.keys(_this.options.bindings).forEach(function (name) {
    	      if (name === 'list autofill' && quill.scroll.whitelist != null && !quill.scroll.whitelist['list']) {
    	        return;
    	      }
    	      if (_this.options.bindings[name]) {
    	        _this.addBinding(_this.options.bindings[name]);
    	      }
    	    });
    	    _this.addBinding({ key: Keyboard.keys.ENTER, shiftKey: null }, handleEnter);
    	    _this.addBinding({ key: Keyboard.keys.ENTER, metaKey: null, ctrlKey: null, altKey: null }, function () {});
    	    if (/Firefox/i.test(navigator.userAgent)) {
    	      // Need to handle delete and backspace for Firefox in the general case #1171
    	      _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true }, handleBackspace);
    	      _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true }, handleDelete);
    	    } else {
    	      _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true, prefix: /^.?$/ }, handleBackspace);
    	      _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true, suffix: /^.?$/ }, handleDelete);
    	    }
    	    _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: false }, handleDeleteRange);
    	    _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: false }, handleDeleteRange);
    	    _this.addBinding({ key: Keyboard.keys.BACKSPACE, altKey: null, ctrlKey: null, metaKey: null, shiftKey: null }, { collapsed: true, offset: 0 }, handleBackspace);
    	    _this.listen();
    	    return _this;
    	  }

    	  _createClass(Keyboard, [{
    	    key: 'addBinding',
    	    value: function addBinding(key) {
    	      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    	      var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    	      var binding = normalize(key);
    	      if (binding == null || binding.key == null) {
    	        return debug.warn('Attempted to add invalid keyboard binding', binding);
    	      }
    	      if (typeof context === 'function') {
    	        context = { handler: context };
    	      }
    	      if (typeof handler === 'function') {
    	        handler = { handler: handler };
    	      }
    	      binding = (0, _extend2.default)(binding, context, handler);
    	      this.bindings[binding.key] = this.bindings[binding.key] || [];
    	      this.bindings[binding.key].push(binding);
    	    }
    	  }, {
    	    key: 'listen',
    	    value: function listen() {
    	      var _this2 = this;

    	      this.quill.root.addEventListener('keydown', function (evt) {
    	        if (evt.defaultPrevented) return;
    	        var which = evt.which || evt.keyCode;
    	        var bindings = (_this2.bindings[which] || []).filter(function (binding) {
    	          return Keyboard.match(evt, binding);
    	        });
    	        if (bindings.length === 0) return;
    	        var range = _this2.quill.getSelection();
    	        if (range == null || !_this2.quill.hasFocus()) return;

    	        var _quill$getLine = _this2.quill.getLine(range.index),
    	            _quill$getLine2 = _slicedToArray(_quill$getLine, 2),
    	            line = _quill$getLine2[0],
    	            offset = _quill$getLine2[1];

    	        var _quill$getLeaf = _this2.quill.getLeaf(range.index),
    	            _quill$getLeaf2 = _slicedToArray(_quill$getLeaf, 2),
    	            leafStart = _quill$getLeaf2[0],
    	            offsetStart = _quill$getLeaf2[1];

    	        var _ref = range.length === 0 ? [leafStart, offsetStart] : _this2.quill.getLeaf(range.index + range.length),
    	            _ref2 = _slicedToArray(_ref, 2),
    	            leafEnd = _ref2[0],
    	            offsetEnd = _ref2[1];

    	        var prefixText = leafStart instanceof _parchment2.default.Text ? leafStart.value().slice(0, offsetStart) : '';
    	        var suffixText = leafEnd instanceof _parchment2.default.Text ? leafEnd.value().slice(offsetEnd) : '';
    	        var curContext = {
    	          collapsed: range.length === 0,
    	          empty: range.length === 0 && line.length() <= 1,
    	          format: _this2.quill.getFormat(range),
    	          offset: offset,
    	          prefix: prefixText,
    	          suffix: suffixText
    	        };
    	        var prevented = bindings.some(function (binding) {
    	          if (binding.collapsed != null && binding.collapsed !== curContext.collapsed) return false;
    	          if (binding.empty != null && binding.empty !== curContext.empty) return false;
    	          if (binding.offset != null && binding.offset !== curContext.offset) return false;
    	          if (Array.isArray(binding.format)) {
    	            // any format is present
    	            if (binding.format.every(function (name) {
    	              return curContext.format[name] == null;
    	            })) {
    	              return false;
    	            }
    	          } else if (_typeof(binding.format) === 'object') {
    	            // all formats must match
    	            if (!Object.keys(binding.format).every(function (name) {
    	              if (binding.format[name] === true) return curContext.format[name] != null;
    	              if (binding.format[name] === false) return curContext.format[name] == null;
    	              return (0, _deepEqual2.default)(binding.format[name], curContext.format[name]);
    	            })) {
    	              return false;
    	            }
    	          }
    	          if (binding.prefix != null && !binding.prefix.test(curContext.prefix)) return false;
    	          if (binding.suffix != null && !binding.suffix.test(curContext.suffix)) return false;
    	          return binding.handler.call(_this2, range, curContext) !== true;
    	        });
    	        if (prevented) {
    	          evt.preventDefault();
    	        }
    	      });
    	    }
    	  }]);

    	  return Keyboard;
    	}(_module2.default);

    	Keyboard.keys = {
    	  BACKSPACE: 8,
    	  TAB: 9,
    	  ENTER: 13,
    	  ESCAPE: 27,
    	  LEFT: 37,
    	  UP: 38,
    	  RIGHT: 39,
    	  DOWN: 40,
    	  DELETE: 46
    	};

    	Keyboard.DEFAULTS = {
    	  bindings: {
    	    'bold': makeFormatHandler('bold'),
    	    'italic': makeFormatHandler('italic'),
    	    'underline': makeFormatHandler('underline'),
    	    'indent': {
    	      // highlight tab or tab at beginning of list, indent or blockquote
    	      key: Keyboard.keys.TAB,
    	      format: ['blockquote', 'indent', 'list'],
    	      handler: function handler(range, context) {
    	        if (context.collapsed && context.offset !== 0) return true;
    	        this.quill.format('indent', '+1', _quill2.default.sources.USER);
    	      }
    	    },
    	    'outdent': {
    	      key: Keyboard.keys.TAB,
    	      shiftKey: true,
    	      format: ['blockquote', 'indent', 'list'],
    	      // highlight tab or tab at beginning of list, indent or blockquote
    	      handler: function handler(range, context) {
    	        if (context.collapsed && context.offset !== 0) return true;
    	        this.quill.format('indent', '-1', _quill2.default.sources.USER);
    	      }
    	    },
    	    'outdent backspace': {
    	      key: Keyboard.keys.BACKSPACE,
    	      collapsed: true,
    	      shiftKey: null,
    	      metaKey: null,
    	      ctrlKey: null,
    	      altKey: null,
    	      format: ['indent', 'list'],
    	      offset: 0,
    	      handler: function handler(range, context) {
    	        if (context.format.indent != null) {
    	          this.quill.format('indent', '-1', _quill2.default.sources.USER);
    	        } else if (context.format.list != null) {
    	          this.quill.format('list', false, _quill2.default.sources.USER);
    	        }
    	      }
    	    },
    	    'indent code-block': makeCodeBlockHandler(true),
    	    'outdent code-block': makeCodeBlockHandler(false),
    	    'remove tab': {
    	      key: Keyboard.keys.TAB,
    	      shiftKey: true,
    	      collapsed: true,
    	      prefix: /\t$/,
    	      handler: function handler(range) {
    	        this.quill.deleteText(range.index - 1, 1, _quill2.default.sources.USER);
    	      }
    	    },
    	    'tab': {
    	      key: Keyboard.keys.TAB,
    	      handler: function handler(range) {
    	        this.quill.history.cutoff();
    	        var delta = new _quillDelta2.default().retain(range.index).delete(range.length).insert('\t');
    	        this.quill.updateContents(delta, _quill2.default.sources.USER);
    	        this.quill.history.cutoff();
    	        this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
    	      }
    	    },
    	    'list empty enter': {
    	      key: Keyboard.keys.ENTER,
    	      collapsed: true,
    	      format: ['list'],
    	      empty: true,
    	      handler: function handler(range, context) {
    	        this.quill.format('list', false, _quill2.default.sources.USER);
    	        if (context.format.indent) {
    	          this.quill.format('indent', false, _quill2.default.sources.USER);
    	        }
    	      }
    	    },
    	    'checklist enter': {
    	      key: Keyboard.keys.ENTER,
    	      collapsed: true,
    	      format: { list: 'checked' },
    	      handler: function handler(range) {
    	        var _quill$getLine3 = this.quill.getLine(range.index),
    	            _quill$getLine4 = _slicedToArray(_quill$getLine3, 2),
    	            line = _quill$getLine4[0],
    	            offset = _quill$getLine4[1];

    	        var formats = (0, _extend2.default)({}, line.formats(), { list: 'checked' });
    	        var delta = new _quillDelta2.default().retain(range.index).insert('\n', formats).retain(line.length() - offset - 1).retain(1, { list: 'unchecked' });
    	        this.quill.updateContents(delta, _quill2.default.sources.USER);
    	        this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
    	        this.quill.scrollIntoView();
    	      }
    	    },
    	    'header enter': {
    	      key: Keyboard.keys.ENTER,
    	      collapsed: true,
    	      format: ['header'],
    	      suffix: /^$/,
    	      handler: function handler(range, context) {
    	        var _quill$getLine5 = this.quill.getLine(range.index),
    	            _quill$getLine6 = _slicedToArray(_quill$getLine5, 2),
    	            line = _quill$getLine6[0],
    	            offset = _quill$getLine6[1];

    	        var delta = new _quillDelta2.default().retain(range.index).insert('\n', context.format).retain(line.length() - offset - 1).retain(1, { header: null });
    	        this.quill.updateContents(delta, _quill2.default.sources.USER);
    	        this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
    	        this.quill.scrollIntoView();
    	      }
    	    },
    	    'list autofill': {
    	      key: ' ',
    	      collapsed: true,
    	      format: { list: false },
    	      prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
    	      handler: function handler(range, context) {
    	        var length = context.prefix.length;

    	        var _quill$getLine7 = this.quill.getLine(range.index),
    	            _quill$getLine8 = _slicedToArray(_quill$getLine7, 2),
    	            line = _quill$getLine8[0],
    	            offset = _quill$getLine8[1];

    	        if (offset > length) return true;
    	        var value = void 0;
    	        switch (context.prefix.trim()) {
    	          case '[]':case '[ ]':
    	            value = 'unchecked';
    	            break;
    	          case '[x]':
    	            value = 'checked';
    	            break;
    	          case '-':case '*':
    	            value = 'bullet';
    	            break;
    	          default:
    	            value = 'ordered';
    	        }
    	        this.quill.insertText(range.index, ' ', _quill2.default.sources.USER);
    	        this.quill.history.cutoff();
    	        var delta = new _quillDelta2.default().retain(range.index - offset).delete(length + 1).retain(line.length() - 2 - offset).retain(1, { list: value });
    	        this.quill.updateContents(delta, _quill2.default.sources.USER);
    	        this.quill.history.cutoff();
    	        this.quill.setSelection(range.index - length, _quill2.default.sources.SILENT);
    	      }
    	    },
    	    'code exit': {
    	      key: Keyboard.keys.ENTER,
    	      collapsed: true,
    	      format: ['code-block'],
    	      prefix: /\n\n$/,
    	      suffix: /^\s+$/,
    	      handler: function handler(range) {
    	        var _quill$getLine9 = this.quill.getLine(range.index),
    	            _quill$getLine10 = _slicedToArray(_quill$getLine9, 2),
    	            line = _quill$getLine10[0],
    	            offset = _quill$getLine10[1];

    	        var delta = new _quillDelta2.default().retain(range.index + line.length() - offset - 2).retain(1, { 'code-block': null }).delete(1);
    	        this.quill.updateContents(delta, _quill2.default.sources.USER);
    	      }
    	    },
    	    'embed left': makeEmbedArrowHandler(Keyboard.keys.LEFT, false),
    	    'embed left shift': makeEmbedArrowHandler(Keyboard.keys.LEFT, true),
    	    'embed right': makeEmbedArrowHandler(Keyboard.keys.RIGHT, false),
    	    'embed right shift': makeEmbedArrowHandler(Keyboard.keys.RIGHT, true)
    	  }
    	};

    	function makeEmbedArrowHandler(key, shiftKey) {
    	  var _ref3;

    	  var where = key === Keyboard.keys.LEFT ? 'prefix' : 'suffix';
    	  return _ref3 = {
    	    key: key,
    	    shiftKey: shiftKey,
    	    altKey: null
    	  }, _defineProperty(_ref3, where, /^$/), _defineProperty(_ref3, 'handler', function handler(range) {
    	    var index = range.index;
    	    if (key === Keyboard.keys.RIGHT) {
    	      index += range.length + 1;
    	    }

    	    var _quill$getLeaf3 = this.quill.getLeaf(index),
    	        _quill$getLeaf4 = _slicedToArray(_quill$getLeaf3, 1),
    	        leaf = _quill$getLeaf4[0];

    	    if (!(leaf instanceof _parchment2.default.Embed)) return true;
    	    if (key === Keyboard.keys.LEFT) {
    	      if (shiftKey) {
    	        this.quill.setSelection(range.index - 1, range.length + 1, _quill2.default.sources.USER);
    	      } else {
    	        this.quill.setSelection(range.index - 1, _quill2.default.sources.USER);
    	      }
    	    } else {
    	      if (shiftKey) {
    	        this.quill.setSelection(range.index, range.length + 1, _quill2.default.sources.USER);
    	      } else {
    	        this.quill.setSelection(range.index + range.length + 1, _quill2.default.sources.USER);
    	      }
    	    }
    	    return false;
    	  }), _ref3;
    	}

    	function handleBackspace(range, context) {
    	  if (range.index === 0 || this.quill.getLength() <= 1) return;

    	  var _quill$getLine11 = this.quill.getLine(range.index),
    	      _quill$getLine12 = _slicedToArray(_quill$getLine11, 1),
    	      line = _quill$getLine12[0];

    	  var formats = {};
    	  if (context.offset === 0) {
    	    var _quill$getLine13 = this.quill.getLine(range.index - 1),
    	        _quill$getLine14 = _slicedToArray(_quill$getLine13, 1),
    	        prev = _quill$getLine14[0];

    	    if (prev != null && prev.length() > 1) {
    	      var curFormats = line.formats();
    	      var prevFormats = this.quill.getFormat(range.index - 1, 1);
    	      formats = _op2.default.attributes.diff(curFormats, prevFormats) || {};
    	    }
    	  }
    	  // Check for astral symbols
    	  var length = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(context.prefix) ? 2 : 1;
    	  this.quill.deleteText(range.index - length, length, _quill2.default.sources.USER);
    	  if (Object.keys(formats).length > 0) {
    	    this.quill.formatLine(range.index - length, length, formats, _quill2.default.sources.USER);
    	  }
    	  this.quill.focus();
    	}

    	function handleDelete(range, context) {
    	  // Check for astral symbols
    	  var length = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(context.suffix) ? 2 : 1;
    	  if (range.index >= this.quill.getLength() - length) return;
    	  var formats = {},
    	      nextLength = 0;

    	  var _quill$getLine15 = this.quill.getLine(range.index),
    	      _quill$getLine16 = _slicedToArray(_quill$getLine15, 1),
    	      line = _quill$getLine16[0];

    	  if (context.offset >= line.length() - 1) {
    	    var _quill$getLine17 = this.quill.getLine(range.index + 1),
    	        _quill$getLine18 = _slicedToArray(_quill$getLine17, 1),
    	        next = _quill$getLine18[0];

    	    if (next) {
    	      var curFormats = line.formats();
    	      var nextFormats = this.quill.getFormat(range.index, 1);
    	      formats = _op2.default.attributes.diff(curFormats, nextFormats) || {};
    	      nextLength = next.length();
    	    }
    	  }
    	  this.quill.deleteText(range.index, length, _quill2.default.sources.USER);
    	  if (Object.keys(formats).length > 0) {
    	    this.quill.formatLine(range.index + nextLength - 1, length, formats, _quill2.default.sources.USER);
    	  }
    	}

    	function handleDeleteRange(range) {
    	  var lines = this.quill.getLines(range);
    	  var formats = {};
    	  if (lines.length > 1) {
    	    var firstFormats = lines[0].formats();
    	    var lastFormats = lines[lines.length - 1].formats();
    	    formats = _op2.default.attributes.diff(lastFormats, firstFormats) || {};
    	  }
    	  this.quill.deleteText(range, _quill2.default.sources.USER);
    	  if (Object.keys(formats).length > 0) {
    	    this.quill.formatLine(range.index, 1, formats, _quill2.default.sources.USER);
    	  }
    	  this.quill.setSelection(range.index, _quill2.default.sources.SILENT);
    	  this.quill.focus();
    	}

    	function handleEnter(range, context) {
    	  var _this3 = this;

    	  if (range.length > 0) {
    	    this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
    	  }
    	  var lineFormats = Object.keys(context.format).reduce(function (lineFormats, format) {
    	    if (_parchment2.default.query(format, _parchment2.default.Scope.BLOCK) && !Array.isArray(context.format[format])) {
    	      lineFormats[format] = context.format[format];
    	    }
    	    return lineFormats;
    	  }, {});
    	  this.quill.insertText(range.index, '\n', lineFormats, _quill2.default.sources.USER);
    	  // Earlier scroll.deleteAt might have messed up our selection,
    	  // so insertText's built in selection preservation is not reliable
    	  this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
    	  this.quill.focus();
    	  Object.keys(context.format).forEach(function (name) {
    	    if (lineFormats[name] != null) return;
    	    if (Array.isArray(context.format[name])) return;
    	    if (name === 'link') return;
    	    _this3.quill.format(name, context.format[name], _quill2.default.sources.USER);
    	  });
    	}

    	function makeCodeBlockHandler(indent) {
    	  return {
    	    key: Keyboard.keys.TAB,
    	    shiftKey: !indent,
    	    format: { 'code-block': true },
    	    handler: function handler(range) {
    	      var CodeBlock = _parchment2.default.query('code-block');
    	      var index = range.index,
    	          length = range.length;

    	      var _quill$scroll$descend = this.quill.scroll.descendant(CodeBlock, index),
    	          _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
    	          block = _quill$scroll$descend2[0],
    	          offset = _quill$scroll$descend2[1];

    	      if (block == null) return;
    	      var scrollIndex = this.quill.getIndex(block);
    	      var start = block.newlineIndex(offset, true) + 1;
    	      var end = block.newlineIndex(scrollIndex + offset + length);
    	      var lines = block.domNode.textContent.slice(start, end).split('\n');
    	      offset = 0;
    	      lines.forEach(function (line, i) {
    	        if (indent) {
    	          block.insertAt(start + offset, CodeBlock.TAB);
    	          offset += CodeBlock.TAB.length;
    	          if (i === 0) {
    	            index += CodeBlock.TAB.length;
    	          } else {
    	            length += CodeBlock.TAB.length;
    	          }
    	        } else if (line.startsWith(CodeBlock.TAB)) {
    	          block.deleteAt(start + offset, CodeBlock.TAB.length);
    	          offset -= CodeBlock.TAB.length;
    	          if (i === 0) {
    	            index -= CodeBlock.TAB.length;
    	          } else {
    	            length -= CodeBlock.TAB.length;
    	          }
    	        }
    	        offset += line.length + 1;
    	      });
    	      this.quill.update(_quill2.default.sources.USER);
    	      this.quill.setSelection(index, length, _quill2.default.sources.SILENT);
    	    }
    	  };
    	}

    	function makeFormatHandler(format) {
    	  return {
    	    key: format[0].toUpperCase(),
    	    shortKey: true,
    	    handler: function handler(range, context) {
    	      this.quill.format(format, !context.format[format], _quill2.default.sources.USER);
    	    }
    	  };
    	}

    	function normalize(binding) {
    	  if (typeof binding === 'string' || typeof binding === 'number') {
    	    return normalize({ key: binding });
    	  }
    	  if ((typeof binding === 'undefined' ? 'undefined' : _typeof(binding)) === 'object') {
    	    binding = (0, _clone2.default)(binding, false);
    	  }
    	  if (typeof binding.key === 'string') {
    	    if (Keyboard.keys[binding.key.toUpperCase()] != null) {
    	      binding.key = Keyboard.keys[binding.key.toUpperCase()];
    	    } else if (binding.key.length === 1) {
    	      binding.key = binding.key.toUpperCase().charCodeAt(0);
    	    } else {
    	      return null;
    	    }
    	  }
    	  if (binding.shortKey) {
    	    binding[SHORTKEY] = binding.shortKey;
    	    delete binding.shortKey;
    	  }
    	  return binding;
    	}

    	exports.default = Keyboard;
    	exports.SHORTKEY = SHORTKEY;

    	/***/ }),
    	/* 24 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _text = __webpack_require__(7);

    	var _text2 = _interopRequireDefault(_text);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Cursor = function (_Parchment$Embed) {
    	  _inherits(Cursor, _Parchment$Embed);

    	  _createClass(Cursor, null, [{
    	    key: 'value',
    	    value: function value() {
    	      return undefined;
    	    }
    	  }]);

    	  function Cursor(domNode, selection) {
    	    _classCallCheck(this, Cursor);

    	    var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this, domNode));

    	    _this.selection = selection;
    	    _this.textNode = document.createTextNode(Cursor.CONTENTS);
    	    _this.domNode.appendChild(_this.textNode);
    	    _this._length = 0;
    	    return _this;
    	  }

    	  _createClass(Cursor, [{
    	    key: 'detach',
    	    value: function detach() {
    	      // super.detach() will also clear domNode.__blot
    	      if (this.parent != null) this.parent.removeChild(this);
    	    }
    	  }, {
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (this._length !== 0) {
    	        return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'format', this).call(this, name, value);
    	      }
    	      var target = this,
    	          index = 0;
    	      while (target != null && target.statics.scope !== _parchment2.default.Scope.BLOCK_BLOT) {
    	        index += target.offset(target.parent);
    	        target = target.parent;
    	      }
    	      if (target != null) {
    	        this._length = Cursor.CONTENTS.length;
    	        target.optimize();
    	        target.formatAt(index, Cursor.CONTENTS.length, name, value);
    	        this._length = 0;
    	      }
    	    }
    	  }, {
    	    key: 'index',
    	    value: function index(node, offset) {
    	      if (node === this.textNode) return 0;
    	      return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'index', this).call(this, node, offset);
    	    }
    	  }, {
    	    key: 'length',
    	    value: function length() {
    	      return this._length;
    	    }
    	  }, {
    	    key: 'position',
    	    value: function position() {
    	      return [this.textNode, this.textNode.data.length];
    	    }
    	  }, {
    	    key: 'remove',
    	    value: function remove() {
    	      _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'remove', this).call(this);
    	      this.parent = null;
    	    }
    	  }, {
    	    key: 'restore',
    	    value: function restore() {
    	      if (this.selection.composing || this.parent == null) return;
    	      var textNode = this.textNode;
    	      var range = this.selection.getNativeRange();
    	      var restoreText = void 0,
    	          start = void 0,
    	          end = void 0;
    	      if (range != null && range.start.node === textNode && range.end.node === textNode) {
    	        var _ref = [textNode, range.start.offset, range.end.offset];
    	        restoreText = _ref[0];
    	        start = _ref[1];
    	        end = _ref[2];
    	      }
    	      // Link format will insert text outside of anchor tag
    	      while (this.domNode.lastChild != null && this.domNode.lastChild !== this.textNode) {
    	        this.domNode.parentNode.insertBefore(this.domNode.lastChild, this.domNode);
    	      }
    	      if (this.textNode.data !== Cursor.CONTENTS) {
    	        var text = this.textNode.data.split(Cursor.CONTENTS).join('');
    	        if (this.next instanceof _text2.default) {
    	          restoreText = this.next.domNode;
    	          this.next.insertAt(0, text);
    	          this.textNode.data = Cursor.CONTENTS;
    	        } else {
    	          this.textNode.data = text;
    	          this.parent.insertBefore(_parchment2.default.create(this.textNode), this);
    	          this.textNode = document.createTextNode(Cursor.CONTENTS);
    	          this.domNode.appendChild(this.textNode);
    	        }
    	      }
    	      this.remove();
    	      if (start != null) {
    	        var _map = [start, end].map(function (offset) {
    	          return Math.max(0, Math.min(restoreText.data.length, offset - 1));
    	        });

    	        var _map2 = _slicedToArray(_map, 2);

    	        start = _map2[0];
    	        end = _map2[1];

    	        return {
    	          startNode: restoreText,
    	          startOffset: start,
    	          endNode: restoreText,
    	          endOffset: end
    	        };
    	      }
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update(mutations, context) {
    	      var _this2 = this;

    	      if (mutations.some(function (mutation) {
    	        return mutation.type === 'characterData' && mutation.target === _this2.textNode;
    	      })) {
    	        var range = this.restore();
    	        if (range) context.range = range;
    	      }
    	    }
    	  }, {
    	    key: 'value',
    	    value: function value() {
    	      return '';
    	    }
    	  }]);

    	  return Cursor;
    	}(_parchment2.default.Embed);

    	Cursor.blotName = 'cursor';
    	Cursor.className = 'ql-cursor';
    	Cursor.tagName = 'span';
    	Cursor.CONTENTS = '\uFEFF'; // Zero width no break space


    	exports.default = Cursor;

    	/***/ }),
    	/* 25 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Container = function (_Parchment$Container) {
    	  _inherits(Container, _Parchment$Container);

    	  function Container() {
    	    _classCallCheck(this, Container);

    	    return _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).apply(this, arguments));
    	  }

    	  return Container;
    	}(_parchment2.default.Container);

    	Container.allowedChildren = [_block2.default, _block.BlockEmbed, Container];

    	exports.default = Container;

    	/***/ }),
    	/* 26 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.ColorStyle = exports.ColorClass = exports.ColorAttributor = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var ColorAttributor = function (_Parchment$Attributor) {
    	  _inherits(ColorAttributor, _Parchment$Attributor);

    	  function ColorAttributor() {
    	    _classCallCheck(this, ColorAttributor);

    	    return _possibleConstructorReturn(this, (ColorAttributor.__proto__ || Object.getPrototypeOf(ColorAttributor)).apply(this, arguments));
    	  }

    	  _createClass(ColorAttributor, [{
    	    key: 'value',
    	    value: function value(domNode) {
    	      var value = _get(ColorAttributor.prototype.__proto__ || Object.getPrototypeOf(ColorAttributor.prototype), 'value', this).call(this, domNode);
    	      if (!value.startsWith('rgb(')) return value;
    	      value = value.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
    	      return '#' + value.split(',').map(function (component) {
    	        return ('00' + parseInt(component).toString(16)).slice(-2);
    	      }).join('');
    	    }
    	  }]);

    	  return ColorAttributor;
    	}(_parchment2.default.Attributor.Style);

    	var ColorClass = new _parchment2.default.Attributor.Class('color', 'ql-color', {
    	  scope: _parchment2.default.Scope.INLINE
    	});
    	var ColorStyle = new ColorAttributor('color', 'color', {
    	  scope: _parchment2.default.Scope.INLINE
    	});

    	exports.ColorAttributor = ColorAttributor;
    	exports.ColorClass = ColorClass;
    	exports.ColorStyle = ColorStyle;

    	/***/ }),
    	/* 27 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.sanitize = exports.default = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Link = function (_Inline) {
    	  _inherits(Link, _Inline);

    	  function Link() {
    	    _classCallCheck(this, Link);

    	    return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    	  }

    	  _createClass(Link, [{
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (name !== this.statics.blotName || !value) return _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), 'format', this).call(this, name, value);
    	      value = this.constructor.sanitize(value);
    	      this.domNode.setAttribute('href', value);
    	    }
    	  }], [{
    	    key: 'create',
    	    value: function create(value) {
    	      var node = _get(Link.__proto__ || Object.getPrototypeOf(Link), 'create', this).call(this, value);
    	      value = this.sanitize(value);
    	      node.setAttribute('href', value);
    	      node.setAttribute('rel', 'noopener noreferrer');
    	      node.setAttribute('target', '_blank');
    	      return node;
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      return domNode.getAttribute('href');
    	    }
    	  }, {
    	    key: 'sanitize',
    	    value: function sanitize(url) {
    	      return _sanitize(url, this.PROTOCOL_WHITELIST) ? url : this.SANITIZED_URL;
    	    }
    	  }]);

    	  return Link;
    	}(_inline2.default);

    	Link.blotName = 'link';
    	Link.tagName = 'A';
    	Link.SANITIZED_URL = 'about:blank';
    	Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel'];

    	function _sanitize(url, protocols) {
    	  var anchor = document.createElement('a');
    	  anchor.href = url;
    	  var protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
    	  return protocols.indexOf(protocol) > -1;
    	}

    	exports.default = Link;
    	exports.sanitize = _sanitize;

    	/***/ }),
    	/* 28 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _keyboard = __webpack_require__(23);

    	var _keyboard2 = _interopRequireDefault(_keyboard);

    	var _dropdown = __webpack_require__(107);

    	var _dropdown2 = _interopRequireDefault(_dropdown);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var optionsCounter = 0;

    	function toggleAriaAttribute(element, attribute) {
    	  element.setAttribute(attribute, !(element.getAttribute(attribute) === 'true'));
    	}

    	var Picker = function () {
    	  function Picker(select) {
    	    var _this = this;

    	    _classCallCheck(this, Picker);

    	    this.select = select;
    	    this.container = document.createElement('span');
    	    this.buildPicker();
    	    this.select.style.display = 'none';
    	    this.select.parentNode.insertBefore(this.container, this.select);

    	    this.label.addEventListener('mousedown', function () {
    	      _this.togglePicker();
    	    });
    	    this.label.addEventListener('keydown', function (event) {
    	      switch (event.keyCode) {
    	        // Allows the "Enter" key to open the picker
    	        case _keyboard2.default.keys.ENTER:
    	          _this.togglePicker();
    	          break;

    	        // Allows the "Escape" key to close the picker
    	        case _keyboard2.default.keys.ESCAPE:
    	          _this.escape();
    	          event.preventDefault();
    	          break;
    	      }
    	    });
    	    this.select.addEventListener('change', this.update.bind(this));
    	  }

    	  _createClass(Picker, [{
    	    key: 'togglePicker',
    	    value: function togglePicker() {
    	      this.container.classList.toggle('ql-expanded');
    	      // Toggle aria-expanded and aria-hidden to make the picker accessible
    	      toggleAriaAttribute(this.label, 'aria-expanded');
    	      toggleAriaAttribute(this.options, 'aria-hidden');
    	    }
    	  }, {
    	    key: 'buildItem',
    	    value: function buildItem(option) {
    	      var _this2 = this;

    	      var item = document.createElement('span');
    	      item.tabIndex = '0';
    	      item.setAttribute('role', 'button');

    	      item.classList.add('ql-picker-item');
    	      if (option.hasAttribute('value')) {
    	        item.setAttribute('data-value', option.getAttribute('value'));
    	      }
    	      if (option.textContent) {
    	        item.setAttribute('data-label', option.textContent);
    	      }
    	      item.addEventListener('click', function () {
    	        _this2.selectItem(item, true);
    	      });
    	      item.addEventListener('keydown', function (event) {
    	        switch (event.keyCode) {
    	          // Allows the "Enter" key to select an item
    	          case _keyboard2.default.keys.ENTER:
    	            _this2.selectItem(item, true);
    	            event.preventDefault();
    	            break;

    	          // Allows the "Escape" key to close the picker
    	          case _keyboard2.default.keys.ESCAPE:
    	            _this2.escape();
    	            event.preventDefault();
    	            break;
    	        }
    	      });

    	      return item;
    	    }
    	  }, {
    	    key: 'buildLabel',
    	    value: function buildLabel() {
    	      var label = document.createElement('span');
    	      label.classList.add('ql-picker-label');
    	      label.innerHTML = _dropdown2.default;
    	      label.tabIndex = '0';
    	      label.setAttribute('role', 'button');
    	      label.setAttribute('aria-expanded', 'false');
    	      this.container.appendChild(label);
    	      return label;
    	    }
    	  }, {
    	    key: 'buildOptions',
    	    value: function buildOptions() {
    	      var _this3 = this;

    	      var options = document.createElement('span');
    	      options.classList.add('ql-picker-options');

    	      // Don't want screen readers to read this until options are visible
    	      options.setAttribute('aria-hidden', 'true');
    	      options.tabIndex = '-1';

    	      // Need a unique id for aria-controls
    	      options.id = 'ql-picker-options-' + optionsCounter;
    	      optionsCounter += 1;
    	      this.label.setAttribute('aria-controls', options.id);

    	      this.options = options;

    	      [].slice.call(this.select.options).forEach(function (option) {
    	        var item = _this3.buildItem(option);
    	        options.appendChild(item);
    	        if (option.selected === true) {
    	          _this3.selectItem(item);
    	        }
    	      });
    	      this.container.appendChild(options);
    	    }
    	  }, {
    	    key: 'buildPicker',
    	    value: function buildPicker() {
    	      var _this4 = this;

    	      [].slice.call(this.select.attributes).forEach(function (item) {
    	        _this4.container.setAttribute(item.name, item.value);
    	      });
    	      this.container.classList.add('ql-picker');
    	      this.label = this.buildLabel();
    	      this.buildOptions();
    	    }
    	  }, {
    	    key: 'escape',
    	    value: function escape() {
    	      var _this5 = this;

    	      // Close menu and return focus to trigger label
    	      this.close();
    	      // Need setTimeout for accessibility to ensure that the browser executes
    	      // focus on the next process thread and after any DOM content changes
    	      setTimeout(function () {
    	        return _this5.label.focus();
    	      }, 1);
    	    }
    	  }, {
    	    key: 'close',
    	    value: function close() {
    	      this.container.classList.remove('ql-expanded');
    	      this.label.setAttribute('aria-expanded', 'false');
    	      this.options.setAttribute('aria-hidden', 'true');
    	    }
    	  }, {
    	    key: 'selectItem',
    	    value: function selectItem(item) {
    	      var trigger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    	      var selected = this.container.querySelector('.ql-selected');
    	      if (item === selected) return;
    	      if (selected != null) {
    	        selected.classList.remove('ql-selected');
    	      }
    	      if (item == null) return;
    	      item.classList.add('ql-selected');
    	      this.select.selectedIndex = [].indexOf.call(item.parentNode.children, item);
    	      if (item.hasAttribute('data-value')) {
    	        this.label.setAttribute('data-value', item.getAttribute('data-value'));
    	      } else {
    	        this.label.removeAttribute('data-value');
    	      }
    	      if (item.hasAttribute('data-label')) {
    	        this.label.setAttribute('data-label', item.getAttribute('data-label'));
    	      } else {
    	        this.label.removeAttribute('data-label');
    	      }
    	      if (trigger) {
    	        if (typeof Event === 'function') {
    	          this.select.dispatchEvent(new Event('change'));
    	        } else if ((typeof Event === 'undefined' ? 'undefined' : _typeof(Event)) === 'object') {
    	          // IE11
    	          var event = document.createEvent('Event');
    	          event.initEvent('change', true, true);
    	          this.select.dispatchEvent(event);
    	        }
    	        this.close();
    	      }
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update() {
    	      var option = void 0;
    	      if (this.select.selectedIndex > -1) {
    	        var item = this.container.querySelector('.ql-picker-options').children[this.select.selectedIndex];
    	        option = this.select.options[this.select.selectedIndex];
    	        this.selectItem(item);
    	      } else {
    	        this.selectItem(null);
    	      }
    	      var isActive = option != null && option !== this.select.querySelector('option[selected]');
    	      this.label.classList.toggle('ql-active', isActive);
    	    }
    	  }]);

    	  return Picker;
    	}();

    	exports.default = Picker;

    	/***/ }),
    	/* 29 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	var _break = __webpack_require__(16);

    	var _break2 = _interopRequireDefault(_break);

    	var _container = __webpack_require__(25);

    	var _container2 = _interopRequireDefault(_container);

    	var _cursor = __webpack_require__(24);

    	var _cursor2 = _interopRequireDefault(_cursor);

    	var _embed = __webpack_require__(35);

    	var _embed2 = _interopRequireDefault(_embed);

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	var _scroll = __webpack_require__(22);

    	var _scroll2 = _interopRequireDefault(_scroll);

    	var _text = __webpack_require__(7);

    	var _text2 = _interopRequireDefault(_text);

    	var _clipboard = __webpack_require__(55);

    	var _clipboard2 = _interopRequireDefault(_clipboard);

    	var _history = __webpack_require__(42);

    	var _history2 = _interopRequireDefault(_history);

    	var _keyboard = __webpack_require__(23);

    	var _keyboard2 = _interopRequireDefault(_keyboard);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	_quill2.default.register({
    	  'blots/block': _block2.default,
    	  'blots/block/embed': _block.BlockEmbed,
    	  'blots/break': _break2.default,
    	  'blots/container': _container2.default,
    	  'blots/cursor': _cursor2.default,
    	  'blots/embed': _embed2.default,
    	  'blots/inline': _inline2.default,
    	  'blots/scroll': _scroll2.default,
    	  'blots/text': _text2.default,

    	  'modules/clipboard': _clipboard2.default,
    	  'modules/history': _history2.default,
    	  'modules/keyboard': _keyboard2.default
    	});

    	_parchment2.default.register(_block2.default, _break2.default, _cursor2.default, _inline2.default, _scroll2.default, _text2.default);

    	exports.default = _quill2.default;

    	/***/ }),
    	/* 30 */
    	/***/ (function(module, exports, __webpack_require__) {

    	Object.defineProperty(exports, "__esModule", { value: true });
    	var Registry = __webpack_require__(1);
    	var ShadowBlot = /** @class */ (function () {
    	    function ShadowBlot(domNode) {
    	        this.domNode = domNode;
    	        // @ts-ignore
    	        this.domNode[Registry.DATA_KEY] = { blot: this };
    	    }
    	    Object.defineProperty(ShadowBlot.prototype, "statics", {
    	        // Hack for accessing inherited static methods
    	        get: function () {
    	            return this.constructor;
    	        },
    	        enumerable: true,
    	        configurable: true
    	    });
    	    ShadowBlot.create = function (value) {
    	        if (this.tagName == null) {
    	            throw new Registry.ParchmentError('Blot definition missing tagName');
    	        }
    	        var node;
    	        if (Array.isArray(this.tagName)) {
    	            if (typeof value === 'string') {
    	                value = value.toUpperCase();
    	                if (parseInt(value).toString() === value) {
    	                    value = parseInt(value);
    	                }
    	            }
    	            if (typeof value === 'number') {
    	                node = document.createElement(this.tagName[value - 1]);
    	            }
    	            else if (this.tagName.indexOf(value) > -1) {
    	                node = document.createElement(value);
    	            }
    	            else {
    	                node = document.createElement(this.tagName[0]);
    	            }
    	        }
    	        else {
    	            node = document.createElement(this.tagName);
    	        }
    	        if (this.className) {
    	            node.classList.add(this.className);
    	        }
    	        return node;
    	    };
    	    ShadowBlot.prototype.attach = function () {
    	        if (this.parent != null) {
    	            this.scroll = this.parent.scroll;
    	        }
    	    };
    	    ShadowBlot.prototype.clone = function () {
    	        var domNode = this.domNode.cloneNode(false);
    	        return Registry.create(domNode);
    	    };
    	    ShadowBlot.prototype.detach = function () {
    	        if (this.parent != null)
    	            this.parent.removeChild(this);
    	        // @ts-ignore
    	        delete this.domNode[Registry.DATA_KEY];
    	    };
    	    ShadowBlot.prototype.deleteAt = function (index, length) {
    	        var blot = this.isolate(index, length);
    	        blot.remove();
    	    };
    	    ShadowBlot.prototype.formatAt = function (index, length, name, value) {
    	        var blot = this.isolate(index, length);
    	        if (Registry.query(name, Registry.Scope.BLOT) != null && value) {
    	            blot.wrap(name, value);
    	        }
    	        else if (Registry.query(name, Registry.Scope.ATTRIBUTE) != null) {
    	            var parent = Registry.create(this.statics.scope);
    	            blot.wrap(parent);
    	            parent.format(name, value);
    	        }
    	    };
    	    ShadowBlot.prototype.insertAt = function (index, value, def) {
    	        var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
    	        var ref = this.split(index);
    	        this.parent.insertBefore(blot, ref);
    	    };
    	    ShadowBlot.prototype.insertInto = function (parentBlot, refBlot) {
    	        if (refBlot === void 0) { refBlot = null; }
    	        if (this.parent != null) {
    	            this.parent.children.remove(this);
    	        }
    	        var refDomNode = null;
    	        parentBlot.children.insertBefore(this, refBlot);
    	        if (refBlot != null) {
    	            refDomNode = refBlot.domNode;
    	        }
    	        if (this.domNode.parentNode != parentBlot.domNode ||
    	            this.domNode.nextSibling != refDomNode) {
    	            parentBlot.domNode.insertBefore(this.domNode, refDomNode);
    	        }
    	        this.parent = parentBlot;
    	        this.attach();
    	    };
    	    ShadowBlot.prototype.isolate = function (index, length) {
    	        var target = this.split(index);
    	        target.split(length);
    	        return target;
    	    };
    	    ShadowBlot.prototype.length = function () {
    	        return 1;
    	    };
    	    ShadowBlot.prototype.offset = function (root) {
    	        if (root === void 0) { root = this.parent; }
    	        if (this.parent == null || this == root)
    	            return 0;
    	        return this.parent.children.offset(this) + this.parent.offset(root);
    	    };
    	    ShadowBlot.prototype.optimize = function (context) {
    	        // TODO clean up once we use WeakMap
    	        // @ts-ignore
    	        if (this.domNode[Registry.DATA_KEY] != null) {
    	            // @ts-ignore
    	            delete this.domNode[Registry.DATA_KEY].mutations;
    	        }
    	    };
    	    ShadowBlot.prototype.remove = function () {
    	        if (this.domNode.parentNode != null) {
    	            this.domNode.parentNode.removeChild(this.domNode);
    	        }
    	        this.detach();
    	    };
    	    ShadowBlot.prototype.replace = function (target) {
    	        if (target.parent == null)
    	            return;
    	        target.parent.insertBefore(this, target.next);
    	        target.remove();
    	    };
    	    ShadowBlot.prototype.replaceWith = function (name, value) {
    	        var replacement = typeof name === 'string' ? Registry.create(name, value) : name;
    	        replacement.replace(this);
    	        return replacement;
    	    };
    	    ShadowBlot.prototype.split = function (index, force) {
    	        return index === 0 ? this : this.next;
    	    };
    	    ShadowBlot.prototype.update = function (mutations, context) {
    	        // Nothing to do by default
    	    };
    	    ShadowBlot.prototype.wrap = function (name, value) {
    	        var wrapper = typeof name === 'string' ? Registry.create(name, value) : name;
    	        if (this.parent != null) {
    	            this.parent.insertBefore(wrapper, this.next);
    	        }
    	        wrapper.appendChild(this);
    	        return wrapper;
    	    };
    	    ShadowBlot.blotName = 'abstract';
    	    return ShadowBlot;
    	}());
    	exports.default = ShadowBlot;


    	/***/ }),
    	/* 31 */
    	/***/ (function(module, exports, __webpack_require__) {

    	Object.defineProperty(exports, "__esModule", { value: true });
    	var attributor_1 = __webpack_require__(12);
    	var class_1 = __webpack_require__(32);
    	var style_1 = __webpack_require__(33);
    	var Registry = __webpack_require__(1);
    	var AttributorStore = /** @class */ (function () {
    	    function AttributorStore(domNode) {
    	        this.attributes = {};
    	        this.domNode = domNode;
    	        this.build();
    	    }
    	    AttributorStore.prototype.attribute = function (attribute, value) {
    	        // verb
    	        if (value) {
    	            if (attribute.add(this.domNode, value)) {
    	                if (attribute.value(this.domNode) != null) {
    	                    this.attributes[attribute.attrName] = attribute;
    	                }
    	                else {
    	                    delete this.attributes[attribute.attrName];
    	                }
    	            }
    	        }
    	        else {
    	            attribute.remove(this.domNode);
    	            delete this.attributes[attribute.attrName];
    	        }
    	    };
    	    AttributorStore.prototype.build = function () {
    	        var _this = this;
    	        this.attributes = {};
    	        var attributes = attributor_1.default.keys(this.domNode);
    	        var classes = class_1.default.keys(this.domNode);
    	        var styles = style_1.default.keys(this.domNode);
    	        attributes
    	            .concat(classes)
    	            .concat(styles)
    	            .forEach(function (name) {
    	            var attr = Registry.query(name, Registry.Scope.ATTRIBUTE);
    	            if (attr instanceof attributor_1.default) {
    	                _this.attributes[attr.attrName] = attr;
    	            }
    	        });
    	    };
    	    AttributorStore.prototype.copy = function (target) {
    	        var _this = this;
    	        Object.keys(this.attributes).forEach(function (key) {
    	            var value = _this.attributes[key].value(_this.domNode);
    	            target.format(key, value);
    	        });
    	    };
    	    AttributorStore.prototype.move = function (target) {
    	        var _this = this;
    	        this.copy(target);
    	        Object.keys(this.attributes).forEach(function (key) {
    	            _this.attributes[key].remove(_this.domNode);
    	        });
    	        this.attributes = {};
    	    };
    	    AttributorStore.prototype.values = function () {
    	        var _this = this;
    	        return Object.keys(this.attributes).reduce(function (attributes, name) {
    	            attributes[name] = _this.attributes[name].value(_this.domNode);
    	            return attributes;
    	        }, {});
    	    };
    	    return AttributorStore;
    	}());
    	exports.default = AttributorStore;


    	/***/ }),
    	/* 32 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var attributor_1 = __webpack_require__(12);
    	function match(node, prefix) {
    	    var className = node.getAttribute('class') || '';
    	    return className.split(/\s+/).filter(function (name) {
    	        return name.indexOf(prefix + "-") === 0;
    	    });
    	}
    	var ClassAttributor = /** @class */ (function (_super) {
    	    __extends(ClassAttributor, _super);
    	    function ClassAttributor() {
    	        return _super !== null && _super.apply(this, arguments) || this;
    	    }
    	    ClassAttributor.keys = function (node) {
    	        return (node.getAttribute('class') || '').split(/\s+/).map(function (name) {
    	            return name
    	                .split('-')
    	                .slice(0, -1)
    	                .join('-');
    	        });
    	    };
    	    ClassAttributor.prototype.add = function (node, value) {
    	        if (!this.canAdd(node, value))
    	            return false;
    	        this.remove(node);
    	        node.classList.add(this.keyName + "-" + value);
    	        return true;
    	    };
    	    ClassAttributor.prototype.remove = function (node) {
    	        var matches = match(node, this.keyName);
    	        matches.forEach(function (name) {
    	            node.classList.remove(name);
    	        });
    	        if (node.classList.length === 0) {
    	            node.removeAttribute('class');
    	        }
    	    };
    	    ClassAttributor.prototype.value = function (node) {
    	        var result = match(node, this.keyName)[0] || '';
    	        var value = result.slice(this.keyName.length + 1); // +1 for hyphen
    	        return this.canAdd(node, value) ? value : '';
    	    };
    	    return ClassAttributor;
    	}(attributor_1.default));
    	exports.default = ClassAttributor;


    	/***/ }),
    	/* 33 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var attributor_1 = __webpack_require__(12);
    	function camelize(name) {
    	    var parts = name.split('-');
    	    var rest = parts
    	        .slice(1)
    	        .map(function (part) {
    	        return part[0].toUpperCase() + part.slice(1);
    	    })
    	        .join('');
    	    return parts[0] + rest;
    	}
    	var StyleAttributor = /** @class */ (function (_super) {
    	    __extends(StyleAttributor, _super);
    	    function StyleAttributor() {
    	        return _super !== null && _super.apply(this, arguments) || this;
    	    }
    	    StyleAttributor.keys = function (node) {
    	        return (node.getAttribute('style') || '').split(';').map(function (value) {
    	            var arr = value.split(':');
    	            return arr[0].trim();
    	        });
    	    };
    	    StyleAttributor.prototype.add = function (node, value) {
    	        if (!this.canAdd(node, value))
    	            return false;
    	        // @ts-ignore
    	        node.style[camelize(this.keyName)] = value;
    	        return true;
    	    };
    	    StyleAttributor.prototype.remove = function (node) {
    	        // @ts-ignore
    	        node.style[camelize(this.keyName)] = '';
    	        if (!node.getAttribute('style')) {
    	            node.removeAttribute('style');
    	        }
    	    };
    	    StyleAttributor.prototype.value = function (node) {
    	        // @ts-ignore
    	        var value = node.style[camelize(this.keyName)];
    	        return this.canAdd(node, value) ? value : '';
    	    };
    	    return StyleAttributor;
    	}(attributor_1.default));
    	exports.default = StyleAttributor;


    	/***/ }),
    	/* 34 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var Theme = function () {
    	  function Theme(quill, options) {
    	    _classCallCheck(this, Theme);

    	    this.quill = quill;
    	    this.options = options;
    	    this.modules = {};
    	  }

    	  _createClass(Theme, [{
    	    key: 'init',
    	    value: function init() {
    	      var _this = this;

    	      Object.keys(this.options.modules).forEach(function (name) {
    	        if (_this.modules[name] == null) {
    	          _this.addModule(name);
    	        }
    	      });
    	    }
    	  }, {
    	    key: 'addModule',
    	    value: function addModule(name) {
    	      var moduleClass = this.quill.constructor.import('modules/' + name);
    	      this.modules[name] = new moduleClass(this.quill, this.options.modules[name] || {});
    	      return this.modules[name];
    	    }
    	  }]);

    	  return Theme;
    	}();

    	Theme.DEFAULTS = {
    	  modules: {}
    	};
    	Theme.themes = {
    	  'default': Theme
    	};

    	exports.default = Theme;

    	/***/ }),
    	/* 35 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _text = __webpack_require__(7);

    	var _text2 = _interopRequireDefault(_text);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var GUARD_TEXT = '\uFEFF';

    	var Embed = function (_Parchment$Embed) {
    	  _inherits(Embed, _Parchment$Embed);

    	  function Embed(node) {
    	    _classCallCheck(this, Embed);

    	    var _this = _possibleConstructorReturn(this, (Embed.__proto__ || Object.getPrototypeOf(Embed)).call(this, node));

    	    _this.contentNode = document.createElement('span');
    	    _this.contentNode.setAttribute('contenteditable', false);
    	    [].slice.call(_this.domNode.childNodes).forEach(function (childNode) {
    	      _this.contentNode.appendChild(childNode);
    	    });
    	    _this.leftGuard = document.createTextNode(GUARD_TEXT);
    	    _this.rightGuard = document.createTextNode(GUARD_TEXT);
    	    _this.domNode.appendChild(_this.leftGuard);
    	    _this.domNode.appendChild(_this.contentNode);
    	    _this.domNode.appendChild(_this.rightGuard);
    	    return _this;
    	  }

    	  _createClass(Embed, [{
    	    key: 'index',
    	    value: function index(node, offset) {
    	      if (node === this.leftGuard) return 0;
    	      if (node === this.rightGuard) return 1;
    	      return _get(Embed.prototype.__proto__ || Object.getPrototypeOf(Embed.prototype), 'index', this).call(this, node, offset);
    	    }
    	  }, {
    	    key: 'restore',
    	    value: function restore(node) {
    	      var range = void 0,
    	          textNode = void 0;
    	      var text = node.data.split(GUARD_TEXT).join('');
    	      if (node === this.leftGuard) {
    	        if (this.prev instanceof _text2.default) {
    	          var prevLength = this.prev.length();
    	          this.prev.insertAt(prevLength, text);
    	          range = {
    	            startNode: this.prev.domNode,
    	            startOffset: prevLength + text.length
    	          };
    	        } else {
    	          textNode = document.createTextNode(text);
    	          this.parent.insertBefore(_parchment2.default.create(textNode), this);
    	          range = {
    	            startNode: textNode,
    	            startOffset: text.length
    	          };
    	        }
    	      } else if (node === this.rightGuard) {
    	        if (this.next instanceof _text2.default) {
    	          this.next.insertAt(0, text);
    	          range = {
    	            startNode: this.next.domNode,
    	            startOffset: text.length
    	          };
    	        } else {
    	          textNode = document.createTextNode(text);
    	          this.parent.insertBefore(_parchment2.default.create(textNode), this.next);
    	          range = {
    	            startNode: textNode,
    	            startOffset: text.length
    	          };
    	        }
    	      }
    	      node.data = GUARD_TEXT;
    	      return range;
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update(mutations, context) {
    	      var _this2 = this;

    	      mutations.forEach(function (mutation) {
    	        if (mutation.type === 'characterData' && (mutation.target === _this2.leftGuard || mutation.target === _this2.rightGuard)) {
    	          var range = _this2.restore(mutation.target);
    	          if (range) context.range = range;
    	        }
    	      });
    	    }
    	  }]);

    	  return Embed;
    	}(_parchment2.default.Embed);

    	exports.default = Embed;

    	/***/ }),
    	/* 36 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.AlignStyle = exports.AlignClass = exports.AlignAttribute = undefined;

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	var config = {
    	  scope: _parchment2.default.Scope.BLOCK,
    	  whitelist: ['right', 'center', 'justify']
    	};

    	var AlignAttribute = new _parchment2.default.Attributor.Attribute('align', 'align', config);
    	var AlignClass = new _parchment2.default.Attributor.Class('align', 'ql-align', config);
    	var AlignStyle = new _parchment2.default.Attributor.Style('align', 'text-align', config);

    	exports.AlignAttribute = AlignAttribute;
    	exports.AlignClass = AlignClass;
    	exports.AlignStyle = AlignStyle;

    	/***/ }),
    	/* 37 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.BackgroundStyle = exports.BackgroundClass = undefined;

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _color = __webpack_require__(26);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	var BackgroundClass = new _parchment2.default.Attributor.Class('background', 'ql-bg', {
    	  scope: _parchment2.default.Scope.INLINE
    	});
    	var BackgroundStyle = new _color.ColorAttributor('background', 'background-color', {
    	  scope: _parchment2.default.Scope.INLINE
    	});

    	exports.BackgroundClass = BackgroundClass;
    	exports.BackgroundStyle = BackgroundStyle;

    	/***/ }),
    	/* 38 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.DirectionStyle = exports.DirectionClass = exports.DirectionAttribute = undefined;

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	var config = {
    	  scope: _parchment2.default.Scope.BLOCK,
    	  whitelist: ['rtl']
    	};

    	var DirectionAttribute = new _parchment2.default.Attributor.Attribute('direction', 'dir', config);
    	var DirectionClass = new _parchment2.default.Attributor.Class('direction', 'ql-direction', config);
    	var DirectionStyle = new _parchment2.default.Attributor.Style('direction', 'direction', config);

    	exports.DirectionAttribute = DirectionAttribute;
    	exports.DirectionClass = DirectionClass;
    	exports.DirectionStyle = DirectionStyle;

    	/***/ }),
    	/* 39 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.FontClass = exports.FontStyle = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var config = {
    	  scope: _parchment2.default.Scope.INLINE,
    	  whitelist: ['serif', 'monospace']
    	};

    	var FontClass = new _parchment2.default.Attributor.Class('font', 'ql-font', config);

    	var FontStyleAttributor = function (_Parchment$Attributor) {
    	  _inherits(FontStyleAttributor, _Parchment$Attributor);

    	  function FontStyleAttributor() {
    	    _classCallCheck(this, FontStyleAttributor);

    	    return _possibleConstructorReturn(this, (FontStyleAttributor.__proto__ || Object.getPrototypeOf(FontStyleAttributor)).apply(this, arguments));
    	  }

    	  _createClass(FontStyleAttributor, [{
    	    key: 'value',
    	    value: function value(node) {
    	      return _get(FontStyleAttributor.prototype.__proto__ || Object.getPrototypeOf(FontStyleAttributor.prototype), 'value', this).call(this, node).replace(/["']/g, '');
    	    }
    	  }]);

    	  return FontStyleAttributor;
    	}(_parchment2.default.Attributor.Style);

    	var FontStyle = new FontStyleAttributor('font', 'font-family', config);

    	exports.FontStyle = FontStyle;
    	exports.FontClass = FontClass;

    	/***/ }),
    	/* 40 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.SizeStyle = exports.SizeClass = undefined;

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	var SizeClass = new _parchment2.default.Attributor.Class('size', 'ql-size', {
    	  scope: _parchment2.default.Scope.INLINE,
    	  whitelist: ['small', 'large', 'huge']
    	});
    	var SizeStyle = new _parchment2.default.Attributor.Style('size', 'font-size', {
    	  scope: _parchment2.default.Scope.INLINE,
    	  whitelist: ['10px', '18px', '32px']
    	});

    	exports.SizeClass = SizeClass;
    	exports.SizeStyle = SizeStyle;

    	/***/ }),
    	/* 41 */
    	/***/ (function(module, exports, __webpack_require__) {


    	module.exports = {
    	  'align': {
    	    '': __webpack_require__(76),
    	    'center': __webpack_require__(77),
    	    'right': __webpack_require__(78),
    	    'justify': __webpack_require__(79)
    	  },
    	  'background': __webpack_require__(80),
    	  'blockquote': __webpack_require__(81),
    	  'bold': __webpack_require__(82),
    	  'clean': __webpack_require__(83),
    	  'code': __webpack_require__(58),
    	  'code-block': __webpack_require__(58),
    	  'color': __webpack_require__(84),
    	  'direction': {
    	    '': __webpack_require__(85),
    	    'rtl': __webpack_require__(86)
    	  },
    	  'float': {
    	    'center': __webpack_require__(87),
    	    'full': __webpack_require__(88),
    	    'left': __webpack_require__(89),
    	    'right': __webpack_require__(90)
    	  },
    	  'formula': __webpack_require__(91),
    	  'header': {
    	    '1': __webpack_require__(92),
    	    '2': __webpack_require__(93)
    	  },
    	  'italic': __webpack_require__(94),
    	  'image': __webpack_require__(95),
    	  'indent': {
    	    '+1': __webpack_require__(96),
    	    '-1': __webpack_require__(97)
    	  },
    	  'link': __webpack_require__(98),
    	  'list': {
    	    'ordered': __webpack_require__(99),
    	    'bullet': __webpack_require__(100),
    	    'check': __webpack_require__(101)
    	  },
    	  'script': {
    	    'sub': __webpack_require__(102),
    	    'super': __webpack_require__(103)
    	  },
    	  'strike': __webpack_require__(104),
    	  'underline': __webpack_require__(105),
    	  'video': __webpack_require__(106)
    	};

    	/***/ }),
    	/* 42 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.getLastChangeIndex = exports.default = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var History = function (_Module) {
    	  _inherits(History, _Module);

    	  function History(quill, options) {
    	    _classCallCheck(this, History);

    	    var _this = _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).call(this, quill, options));

    	    _this.lastRecorded = 0;
    	    _this.ignoreChange = false;
    	    _this.clear();
    	    _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (eventName, delta, oldDelta, source) {
    	      if (eventName !== _quill2.default.events.TEXT_CHANGE || _this.ignoreChange) return;
    	      if (!_this.options.userOnly || source === _quill2.default.sources.USER) {
    	        _this.record(delta, oldDelta);
    	      } else {
    	        _this.transform(delta);
    	      }
    	    });
    	    _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true }, _this.undo.bind(_this));
    	    _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true, shiftKey: true }, _this.redo.bind(_this));
    	    if (/Win/i.test(navigator.platform)) {
    	      _this.quill.keyboard.addBinding({ key: 'Y', shortKey: true }, _this.redo.bind(_this));
    	    }
    	    return _this;
    	  }

    	  _createClass(History, [{
    	    key: 'change',
    	    value: function change(source, dest) {
    	      if (this.stack[source].length === 0) return;
    	      var delta = this.stack[source].pop();
    	      this.stack[dest].push(delta);
    	      this.lastRecorded = 0;
    	      this.ignoreChange = true;
    	      this.quill.updateContents(delta[source], _quill2.default.sources.USER);
    	      this.ignoreChange = false;
    	      var index = getLastChangeIndex(delta[source]);
    	      this.quill.setSelection(index);
    	    }
    	  }, {
    	    key: 'clear',
    	    value: function clear() {
    	      this.stack = { undo: [], redo: [] };
    	    }
    	  }, {
    	    key: 'cutoff',
    	    value: function cutoff() {
    	      this.lastRecorded = 0;
    	    }
    	  }, {
    	    key: 'record',
    	    value: function record(changeDelta, oldDelta) {
    	      if (changeDelta.ops.length === 0) return;
    	      this.stack.redo = [];
    	      var undoDelta = this.quill.getContents().diff(oldDelta);
    	      var timestamp = Date.now();
    	      if (this.lastRecorded + this.options.delay > timestamp && this.stack.undo.length > 0) {
    	        var delta = this.stack.undo.pop();
    	        undoDelta = undoDelta.compose(delta.undo);
    	        changeDelta = delta.redo.compose(changeDelta);
    	      } else {
    	        this.lastRecorded = timestamp;
    	      }
    	      this.stack.undo.push({
    	        redo: changeDelta,
    	        undo: undoDelta
    	      });
    	      if (this.stack.undo.length > this.options.maxStack) {
    	        this.stack.undo.shift();
    	      }
    	    }
    	  }, {
    	    key: 'redo',
    	    value: function redo() {
    	      this.change('redo', 'undo');
    	    }
    	  }, {
    	    key: 'transform',
    	    value: function transform(delta) {
    	      this.stack.undo.forEach(function (change) {
    	        change.undo = delta.transform(change.undo, true);
    	        change.redo = delta.transform(change.redo, true);
    	      });
    	      this.stack.redo.forEach(function (change) {
    	        change.undo = delta.transform(change.undo, true);
    	        change.redo = delta.transform(change.redo, true);
    	      });
    	    }
    	  }, {
    	    key: 'undo',
    	    value: function undo() {
    	      this.change('undo', 'redo');
    	    }
    	  }]);

    	  return History;
    	}(_module2.default);

    	History.DEFAULTS = {
    	  delay: 1000,
    	  maxStack: 100,
    	  userOnly: false
    	};

    	function endsWithNewlineChange(delta) {
    	  var lastOp = delta.ops[delta.ops.length - 1];
    	  if (lastOp == null) return false;
    	  if (lastOp.insert != null) {
    	    return typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n');
    	  }
    	  if (lastOp.attributes != null) {
    	    return Object.keys(lastOp.attributes).some(function (attr) {
    	      return _parchment2.default.query(attr, _parchment2.default.Scope.BLOCK) != null;
    	    });
    	  }
    	  return false;
    	}

    	function getLastChangeIndex(delta) {
    	  var deleteLength = delta.reduce(function (length, op) {
    	    length += op.delete || 0;
    	    return length;
    	  }, 0);
    	  var changeIndex = delta.length() - deleteLength;
    	  if (endsWithNewlineChange(delta)) {
    	    changeIndex -= 1;
    	  }
    	  return changeIndex;
    	}

    	exports.default = History;
    	exports.getLastChangeIndex = getLastChangeIndex;

    	/***/ }),
    	/* 43 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.BaseTooltip = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _emitter = __webpack_require__(8);

    	var _emitter2 = _interopRequireDefault(_emitter);

    	var _keyboard = __webpack_require__(23);

    	var _keyboard2 = _interopRequireDefault(_keyboard);

    	var _theme = __webpack_require__(34);

    	var _theme2 = _interopRequireDefault(_theme);

    	var _colorPicker = __webpack_require__(59);

    	var _colorPicker2 = _interopRequireDefault(_colorPicker);

    	var _iconPicker = __webpack_require__(60);

    	var _iconPicker2 = _interopRequireDefault(_iconPicker);

    	var _picker = __webpack_require__(28);

    	var _picker2 = _interopRequireDefault(_picker);

    	var _tooltip = __webpack_require__(61);

    	var _tooltip2 = _interopRequireDefault(_tooltip);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var ALIGNS = [false, 'center', 'right', 'justify'];

    	var COLORS = ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"];

    	var FONTS = [false, 'serif', 'monospace'];

    	var HEADERS = ['1', '2', '3', false];

    	var SIZES = ['small', false, 'large', 'huge'];

    	var BaseTheme = function (_Theme) {
    	  _inherits(BaseTheme, _Theme);

    	  function BaseTheme(quill, options) {
    	    _classCallCheck(this, BaseTheme);

    	    var _this = _possibleConstructorReturn(this, (BaseTheme.__proto__ || Object.getPrototypeOf(BaseTheme)).call(this, quill, options));

    	    var listener = function listener(e) {
    	      if (!document.body.contains(quill.root)) {
    	        return document.body.removeEventListener('click', listener);
    	      }
    	      if (_this.tooltip != null && !_this.tooltip.root.contains(e.target) && document.activeElement !== _this.tooltip.textbox && !_this.quill.hasFocus()) {
    	        _this.tooltip.hide();
    	      }
    	      if (_this.pickers != null) {
    	        _this.pickers.forEach(function (picker) {
    	          if (!picker.container.contains(e.target)) {
    	            picker.close();
    	          }
    	        });
    	      }
    	    };
    	    quill.emitter.listenDOM('click', document.body, listener);
    	    return _this;
    	  }

    	  _createClass(BaseTheme, [{
    	    key: 'addModule',
    	    value: function addModule(name) {
    	      var module = _get(BaseTheme.prototype.__proto__ || Object.getPrototypeOf(BaseTheme.prototype), 'addModule', this).call(this, name);
    	      if (name === 'toolbar') {
    	        this.extendToolbar(module);
    	      }
    	      return module;
    	    }
    	  }, {
    	    key: 'buildButtons',
    	    value: function buildButtons(buttons, icons) {
    	      buttons.forEach(function (button) {
    	        var className = button.getAttribute('class') || '';
    	        className.split(/\s+/).forEach(function (name) {
    	          if (!name.startsWith('ql-')) return;
    	          name = name.slice('ql-'.length);
    	          if (icons[name] == null) return;
    	          if (name === 'direction') {
    	            button.innerHTML = icons[name][''] + icons[name]['rtl'];
    	          } else if (typeof icons[name] === 'string') {
    	            button.innerHTML = icons[name];
    	          } else {
    	            var value = button.value || '';
    	            if (value != null && icons[name][value]) {
    	              button.innerHTML = icons[name][value];
    	            }
    	          }
    	        });
    	      });
    	    }
    	  }, {
    	    key: 'buildPickers',
    	    value: function buildPickers(selects, icons) {
    	      var _this2 = this;

    	      this.pickers = selects.map(function (select) {
    	        if (select.classList.contains('ql-align')) {
    	          if (select.querySelector('option') == null) {
    	            fillSelect(select, ALIGNS);
    	          }
    	          return new _iconPicker2.default(select, icons.align);
    	        } else if (select.classList.contains('ql-background') || select.classList.contains('ql-color')) {
    	          var format = select.classList.contains('ql-background') ? 'background' : 'color';
    	          if (select.querySelector('option') == null) {
    	            fillSelect(select, COLORS, format === 'background' ? '#ffffff' : '#000000');
    	          }
    	          return new _colorPicker2.default(select, icons[format]);
    	        } else {
    	          if (select.querySelector('option') == null) {
    	            if (select.classList.contains('ql-font')) {
    	              fillSelect(select, FONTS);
    	            } else if (select.classList.contains('ql-header')) {
    	              fillSelect(select, HEADERS);
    	            } else if (select.classList.contains('ql-size')) {
    	              fillSelect(select, SIZES);
    	            }
    	          }
    	          return new _picker2.default(select);
    	        }
    	      });
    	      var update = function update() {
    	        _this2.pickers.forEach(function (picker) {
    	          picker.update();
    	        });
    	      };
    	      this.quill.on(_emitter2.default.events.EDITOR_CHANGE, update);
    	    }
    	  }]);

    	  return BaseTheme;
    	}(_theme2.default);

    	BaseTheme.DEFAULTS = (0, _extend2.default)(true, {}, _theme2.default.DEFAULTS, {
    	  modules: {
    	    toolbar: {
    	      handlers: {
    	        formula: function formula() {
    	          this.quill.theme.tooltip.edit('formula');
    	        },
    	        image: function image() {
    	          var _this3 = this;

    	          var fileInput = this.container.querySelector('input.ql-image[type=file]');
    	          if (fileInput == null) {
    	            fileInput = document.createElement('input');
    	            fileInput.setAttribute('type', 'file');
    	            fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
    	            fileInput.classList.add('ql-image');
    	            fileInput.addEventListener('change', function () {
    	              if (fileInput.files != null && fileInput.files[0] != null) {
    	                var reader = new FileReader();
    	                reader.onload = function (e) {
    	                  var range = _this3.quill.getSelection(true);
    	                  _this3.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert({ image: e.target.result }), _emitter2.default.sources.USER);
    	                  _this3.quill.setSelection(range.index + 1, _emitter2.default.sources.SILENT);
    	                  fileInput.value = "";
    	                };
    	                reader.readAsDataURL(fileInput.files[0]);
    	              }
    	            });
    	            this.container.appendChild(fileInput);
    	          }
    	          fileInput.click();
    	        },
    	        video: function video() {
    	          this.quill.theme.tooltip.edit('video');
    	        }
    	      }
    	    }
    	  }
    	});

    	var BaseTooltip = function (_Tooltip) {
    	  _inherits(BaseTooltip, _Tooltip);

    	  function BaseTooltip(quill, boundsContainer) {
    	    _classCallCheck(this, BaseTooltip);

    	    var _this4 = _possibleConstructorReturn(this, (BaseTooltip.__proto__ || Object.getPrototypeOf(BaseTooltip)).call(this, quill, boundsContainer));

    	    _this4.textbox = _this4.root.querySelector('input[type="text"]');
    	    _this4.listen();
    	    return _this4;
    	  }

    	  _createClass(BaseTooltip, [{
    	    key: 'listen',
    	    value: function listen() {
    	      var _this5 = this;

    	      this.textbox.addEventListener('keydown', function (event) {
    	        if (_keyboard2.default.match(event, 'enter')) {
    	          _this5.save();
    	          event.preventDefault();
    	        } else if (_keyboard2.default.match(event, 'escape')) {
    	          _this5.cancel();
    	          event.preventDefault();
    	        }
    	      });
    	    }
    	  }, {
    	    key: 'cancel',
    	    value: function cancel() {
    	      this.hide();
    	    }
    	  }, {
    	    key: 'edit',
    	    value: function edit() {
    	      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'link';
    	      var preview = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    	      this.root.classList.remove('ql-hidden');
    	      this.root.classList.add('ql-editing');
    	      if (preview != null) {
    	        this.textbox.value = preview;
    	      } else if (mode !== this.root.getAttribute('data-mode')) {
    	        this.textbox.value = '';
    	      }
    	      this.position(this.quill.getBounds(this.quill.selection.savedRange));
    	      this.textbox.select();
    	      this.textbox.setAttribute('placeholder', this.textbox.getAttribute('data-' + mode) || '');
    	      this.root.setAttribute('data-mode', mode);
    	    }
    	  }, {
    	    key: 'restoreFocus',
    	    value: function restoreFocus() {
    	      var scrollTop = this.quill.scrollingContainer.scrollTop;
    	      this.quill.focus();
    	      this.quill.scrollingContainer.scrollTop = scrollTop;
    	    }
    	  }, {
    	    key: 'save',
    	    value: function save() {
    	      var value = this.textbox.value;
    	      switch (this.root.getAttribute('data-mode')) {
    	        case 'link':
    	          {
    	            var scrollTop = this.quill.root.scrollTop;
    	            if (this.linkRange) {
    	              this.quill.formatText(this.linkRange, 'link', value, _emitter2.default.sources.USER);
    	              delete this.linkRange;
    	            } else {
    	              this.restoreFocus();
    	              this.quill.format('link', value, _emitter2.default.sources.USER);
    	            }
    	            this.quill.root.scrollTop = scrollTop;
    	            break;
    	          }
    	        case 'video':
    	          {
    	            value = extractVideoUrl(value);
    	          } // eslint-disable-next-line no-fallthrough
    	        case 'formula':
    	          {
    	            if (!value) break;
    	            var range = this.quill.getSelection(true);
    	            if (range != null) {
    	              var index = range.index + range.length;
    	              this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value, _emitter2.default.sources.USER);
    	              if (this.root.getAttribute('data-mode') === 'formula') {
    	                this.quill.insertText(index + 1, ' ', _emitter2.default.sources.USER);
    	              }
    	              this.quill.setSelection(index + 2, _emitter2.default.sources.USER);
    	            }
    	            break;
    	          }
    	      }
    	      this.textbox.value = '';
    	      this.hide();
    	    }
    	  }]);

    	  return BaseTooltip;
    	}(_tooltip2.default);

    	function extractVideoUrl(url) {
    	  var match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
    	  if (match) {
    	    return (match[1] || 'https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
    	  }
    	  if (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)) {
    	    // eslint-disable-line no-cond-assign
    	    return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/';
    	  }
    	  return url;
    	}

    	function fillSelect(select, values) {
    	  var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    	  values.forEach(function (value) {
    	    var option = document.createElement('option');
    	    if (value === defaultValue) {
    	      option.setAttribute('selected', 'selected');
    	    } else {
    	      option.setAttribute('value', value);
    	    }
    	    select.appendChild(option);
    	  });
    	}

    	exports.BaseTooltip = BaseTooltip;
    	exports.default = BaseTheme;

    	/***/ }),
    	/* 44 */
    	/***/ (function(module, exports, __webpack_require__) {

    	Object.defineProperty(exports, "__esModule", { value: true });
    	var LinkedList = /** @class */ (function () {
    	    function LinkedList() {
    	        this.head = this.tail = null;
    	        this.length = 0;
    	    }
    	    LinkedList.prototype.append = function () {
    	        var nodes = [];
    	        for (var _i = 0; _i < arguments.length; _i++) {
    	            nodes[_i] = arguments[_i];
    	        }
    	        this.insertBefore(nodes[0], null);
    	        if (nodes.length > 1) {
    	            this.append.apply(this, nodes.slice(1));
    	        }
    	    };
    	    LinkedList.prototype.contains = function (node) {
    	        var cur, next = this.iterator();
    	        while ((cur = next())) {
    	            if (cur === node)
    	                return true;
    	        }
    	        return false;
    	    };
    	    LinkedList.prototype.insertBefore = function (node, refNode) {
    	        if (!node)
    	            return;
    	        node.next = refNode;
    	        if (refNode != null) {
    	            node.prev = refNode.prev;
    	            if (refNode.prev != null) {
    	                refNode.prev.next = node;
    	            }
    	            refNode.prev = node;
    	            if (refNode === this.head) {
    	                this.head = node;
    	            }
    	        }
    	        else if (this.tail != null) {
    	            this.tail.next = node;
    	            node.prev = this.tail;
    	            this.tail = node;
    	        }
    	        else {
    	            node.prev = null;
    	            this.head = this.tail = node;
    	        }
    	        this.length += 1;
    	    };
    	    LinkedList.prototype.offset = function (target) {
    	        var index = 0, cur = this.head;
    	        while (cur != null) {
    	            if (cur === target)
    	                return index;
    	            index += cur.length();
    	            cur = cur.next;
    	        }
    	        return -1;
    	    };
    	    LinkedList.prototype.remove = function (node) {
    	        if (!this.contains(node))
    	            return;
    	        if (node.prev != null)
    	            node.prev.next = node.next;
    	        if (node.next != null)
    	            node.next.prev = node.prev;
    	        if (node === this.head)
    	            this.head = node.next;
    	        if (node === this.tail)
    	            this.tail = node.prev;
    	        this.length -= 1;
    	    };
    	    LinkedList.prototype.iterator = function (curNode) {
    	        if (curNode === void 0) { curNode = this.head; }
    	        // TODO use yield when we can
    	        return function () {
    	            var ret = curNode;
    	            if (curNode != null)
    	                curNode = curNode.next;
    	            return ret;
    	        };
    	    };
    	    LinkedList.prototype.find = function (index, inclusive) {
    	        if (inclusive === void 0) { inclusive = false; }
    	        var cur, next = this.iterator();
    	        while ((cur = next())) {
    	            var length = cur.length();
    	            if (index < length ||
    	                (inclusive && index === length && (cur.next == null || cur.next.length() !== 0))) {
    	                return [cur, index];
    	            }
    	            index -= length;
    	        }
    	        return [null, 0];
    	    };
    	    LinkedList.prototype.forEach = function (callback) {
    	        var cur, next = this.iterator();
    	        while ((cur = next())) {
    	            callback(cur);
    	        }
    	    };
    	    LinkedList.prototype.forEachAt = function (index, length, callback) {
    	        if (length <= 0)
    	            return;
    	        var _a = this.find(index), startNode = _a[0], offset = _a[1];
    	        var cur, curIndex = index - offset, next = this.iterator(startNode);
    	        while ((cur = next()) && curIndex < index + length) {
    	            var curLength = cur.length();
    	            if (index > curIndex) {
    	                callback(cur, index - curIndex, Math.min(length, curIndex + curLength - index));
    	            }
    	            else {
    	                callback(cur, 0, Math.min(curLength, index + length - curIndex));
    	            }
    	            curIndex += curLength;
    	        }
    	    };
    	    LinkedList.prototype.map = function (callback) {
    	        return this.reduce(function (memo, cur) {
    	            memo.push(callback(cur));
    	            return memo;
    	        }, []);
    	    };
    	    LinkedList.prototype.reduce = function (callback, memo) {
    	        var cur, next = this.iterator();
    	        while ((cur = next())) {
    	            memo = callback(memo, cur);
    	        }
    	        return memo;
    	    };
    	    return LinkedList;
    	}());
    	exports.default = LinkedList;


    	/***/ }),
    	/* 45 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var container_1 = __webpack_require__(17);
    	var Registry = __webpack_require__(1);
    	var OBSERVER_CONFIG = {
    	    attributes: true,
    	    characterData: true,
    	    characterDataOldValue: true,
    	    childList: true,
    	    subtree: true,
    	};
    	var MAX_OPTIMIZE_ITERATIONS = 100;
    	var ScrollBlot = /** @class */ (function (_super) {
    	    __extends(ScrollBlot, _super);
    	    function ScrollBlot(node) {
    	        var _this = _super.call(this, node) || this;
    	        _this.scroll = _this;
    	        _this.observer = new MutationObserver(function (mutations) {
    	            _this.update(mutations);
    	        });
    	        _this.observer.observe(_this.domNode, OBSERVER_CONFIG);
    	        _this.attach();
    	        return _this;
    	    }
    	    ScrollBlot.prototype.detach = function () {
    	        _super.prototype.detach.call(this);
    	        this.observer.disconnect();
    	    };
    	    ScrollBlot.prototype.deleteAt = function (index, length) {
    	        this.update();
    	        if (index === 0 && length === this.length()) {
    	            this.children.forEach(function (child) {
    	                child.remove();
    	            });
    	        }
    	        else {
    	            _super.prototype.deleteAt.call(this, index, length);
    	        }
    	    };
    	    ScrollBlot.prototype.formatAt = function (index, length, name, value) {
    	        this.update();
    	        _super.prototype.formatAt.call(this, index, length, name, value);
    	    };
    	    ScrollBlot.prototype.insertAt = function (index, value, def) {
    	        this.update();
    	        _super.prototype.insertAt.call(this, index, value, def);
    	    };
    	    ScrollBlot.prototype.optimize = function (mutations, context) {
    	        var _this = this;
    	        if (mutations === void 0) { mutations = []; }
    	        if (context === void 0) { context = {}; }
    	        _super.prototype.optimize.call(this, context);
    	        // We must modify mutations directly, cannot make copy and then modify
    	        var records = [].slice.call(this.observer.takeRecords());
    	        // Array.push currently seems to be implemented by a non-tail recursive function
    	        // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
    	        while (records.length > 0)
    	            mutations.push(records.pop());
    	        // TODO use WeakMap
    	        var mark = function (blot, markParent) {
    	            if (markParent === void 0) { markParent = true; }
    	            if (blot == null || blot === _this)
    	                return;
    	            if (blot.domNode.parentNode == null)
    	                return;
    	            // @ts-ignore
    	            if (blot.domNode[Registry.DATA_KEY].mutations == null) {
    	                // @ts-ignore
    	                blot.domNode[Registry.DATA_KEY].mutations = [];
    	            }
    	            if (markParent)
    	                mark(blot.parent);
    	        };
    	        var optimize = function (blot) {
    	            // Post-order traversal
    	            if (
    	            // @ts-ignore
    	            blot.domNode[Registry.DATA_KEY] == null ||
    	                // @ts-ignore
    	                blot.domNode[Registry.DATA_KEY].mutations == null) {
    	                return;
    	            }
    	            if (blot instanceof container_1.default) {
    	                blot.children.forEach(optimize);
    	            }
    	            blot.optimize(context);
    	        };
    	        var remaining = mutations;
    	        for (var i = 0; remaining.length > 0; i += 1) {
    	            if (i >= MAX_OPTIMIZE_ITERATIONS) {
    	                throw new Error('[Parchment] Maximum optimize iterations reached');
    	            }
    	            remaining.forEach(function (mutation) {
    	                var blot = Registry.find(mutation.target, true);
    	                if (blot == null)
    	                    return;
    	                if (blot.domNode === mutation.target) {
    	                    if (mutation.type === 'childList') {
    	                        mark(Registry.find(mutation.previousSibling, false));
    	                        [].forEach.call(mutation.addedNodes, function (node) {
    	                            var child = Registry.find(node, false);
    	                            mark(child, false);
    	                            if (child instanceof container_1.default) {
    	                                child.children.forEach(function (grandChild) {
    	                                    mark(grandChild, false);
    	                                });
    	                            }
    	                        });
    	                    }
    	                    else if (mutation.type === 'attributes') {
    	                        mark(blot.prev);
    	                    }
    	                }
    	                mark(blot);
    	            });
    	            this.children.forEach(optimize);
    	            remaining = [].slice.call(this.observer.takeRecords());
    	            records = remaining.slice();
    	            while (records.length > 0)
    	                mutations.push(records.pop());
    	        }
    	    };
    	    ScrollBlot.prototype.update = function (mutations, context) {
    	        var _this = this;
    	        if (context === void 0) { context = {}; }
    	        mutations = mutations || this.observer.takeRecords();
    	        // TODO use WeakMap
    	        mutations
    	            .map(function (mutation) {
    	            var blot = Registry.find(mutation.target, true);
    	            if (blot == null)
    	                return null;
    	            // @ts-ignore
    	            if (blot.domNode[Registry.DATA_KEY].mutations == null) {
    	                // @ts-ignore
    	                blot.domNode[Registry.DATA_KEY].mutations = [mutation];
    	                return blot;
    	            }
    	            else {
    	                // @ts-ignore
    	                blot.domNode[Registry.DATA_KEY].mutations.push(mutation);
    	                return null;
    	            }
    	        })
    	            .forEach(function (blot) {
    	            if (blot == null ||
    	                blot === _this ||
    	                //@ts-ignore
    	                blot.domNode[Registry.DATA_KEY] == null)
    	                return;
    	            // @ts-ignore
    	            blot.update(blot.domNode[Registry.DATA_KEY].mutations || [], context);
    	        });
    	        // @ts-ignore
    	        if (this.domNode[Registry.DATA_KEY].mutations != null) {
    	            // @ts-ignore
    	            _super.prototype.update.call(this, this.domNode[Registry.DATA_KEY].mutations, context);
    	        }
    	        this.optimize(mutations, context);
    	    };
    	    ScrollBlot.blotName = 'scroll';
    	    ScrollBlot.defaultChild = 'block';
    	    ScrollBlot.scope = Registry.Scope.BLOCK_BLOT;
    	    ScrollBlot.tagName = 'DIV';
    	    return ScrollBlot;
    	}(container_1.default));
    	exports.default = ScrollBlot;


    	/***/ }),
    	/* 46 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var format_1 = __webpack_require__(18);
    	var Registry = __webpack_require__(1);
    	// Shallow object comparison
    	function isEqual(obj1, obj2) {
    	    if (Object.keys(obj1).length !== Object.keys(obj2).length)
    	        return false;
    	    // @ts-ignore
    	    for (var prop in obj1) {
    	        // @ts-ignore
    	        if (obj1[prop] !== obj2[prop])
    	            return false;
    	    }
    	    return true;
    	}
    	var InlineBlot = /** @class */ (function (_super) {
    	    __extends(InlineBlot, _super);
    	    function InlineBlot() {
    	        return _super !== null && _super.apply(this, arguments) || this;
    	    }
    	    InlineBlot.formats = function (domNode) {
    	        if (domNode.tagName === InlineBlot.tagName)
    	            return undefined;
    	        return _super.formats.call(this, domNode);
    	    };
    	    InlineBlot.prototype.format = function (name, value) {
    	        var _this = this;
    	        if (name === this.statics.blotName && !value) {
    	            this.children.forEach(function (child) {
    	                if (!(child instanceof format_1.default)) {
    	                    child = child.wrap(InlineBlot.blotName, true);
    	                }
    	                _this.attributes.copy(child);
    	            });
    	            this.unwrap();
    	        }
    	        else {
    	            _super.prototype.format.call(this, name, value);
    	        }
    	    };
    	    InlineBlot.prototype.formatAt = function (index, length, name, value) {
    	        if (this.formats()[name] != null || Registry.query(name, Registry.Scope.ATTRIBUTE)) {
    	            var blot = this.isolate(index, length);
    	            blot.format(name, value);
    	        }
    	        else {
    	            _super.prototype.formatAt.call(this, index, length, name, value);
    	        }
    	    };
    	    InlineBlot.prototype.optimize = function (context) {
    	        _super.prototype.optimize.call(this, context);
    	        var formats = this.formats();
    	        if (Object.keys(formats).length === 0) {
    	            return this.unwrap(); // unformatted span
    	        }
    	        var next = this.next;
    	        if (next instanceof InlineBlot && next.prev === this && isEqual(formats, next.formats())) {
    	            next.moveChildren(this);
    	            next.remove();
    	        }
    	    };
    	    InlineBlot.blotName = 'inline';
    	    InlineBlot.scope = Registry.Scope.INLINE_BLOT;
    	    InlineBlot.tagName = 'SPAN';
    	    return InlineBlot;
    	}(format_1.default));
    	exports.default = InlineBlot;


    	/***/ }),
    	/* 47 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var format_1 = __webpack_require__(18);
    	var Registry = __webpack_require__(1);
    	var BlockBlot = /** @class */ (function (_super) {
    	    __extends(BlockBlot, _super);
    	    function BlockBlot() {
    	        return _super !== null && _super.apply(this, arguments) || this;
    	    }
    	    BlockBlot.formats = function (domNode) {
    	        var tagName = Registry.query(BlockBlot.blotName).tagName;
    	        if (domNode.tagName === tagName)
    	            return undefined;
    	        return _super.formats.call(this, domNode);
    	    };
    	    BlockBlot.prototype.format = function (name, value) {
    	        if (Registry.query(name, Registry.Scope.BLOCK) == null) {
    	            return;
    	        }
    	        else if (name === this.statics.blotName && !value) {
    	            this.replaceWith(BlockBlot.blotName);
    	        }
    	        else {
    	            _super.prototype.format.call(this, name, value);
    	        }
    	    };
    	    BlockBlot.prototype.formatAt = function (index, length, name, value) {
    	        if (Registry.query(name, Registry.Scope.BLOCK) != null) {
    	            this.format(name, value);
    	        }
    	        else {
    	            _super.prototype.formatAt.call(this, index, length, name, value);
    	        }
    	    };
    	    BlockBlot.prototype.insertAt = function (index, value, def) {
    	        if (def == null || Registry.query(value, Registry.Scope.INLINE) != null) {
    	            // Insert text or inline
    	            _super.prototype.insertAt.call(this, index, value, def);
    	        }
    	        else {
    	            var after = this.split(index);
    	            var blot = Registry.create(value, def);
    	            after.parent.insertBefore(blot, after);
    	        }
    	    };
    	    BlockBlot.prototype.update = function (mutations, context) {
    	        if (navigator.userAgent.match(/Trident/)) {
    	            this.build();
    	        }
    	        else {
    	            _super.prototype.update.call(this, mutations, context);
    	        }
    	    };
    	    BlockBlot.blotName = 'block';
    	    BlockBlot.scope = Registry.Scope.BLOCK_BLOT;
    	    BlockBlot.tagName = 'P';
    	    return BlockBlot;
    	}(format_1.default));
    	exports.default = BlockBlot;


    	/***/ }),
    	/* 48 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var leaf_1 = __webpack_require__(19);
    	var EmbedBlot = /** @class */ (function (_super) {
    	    __extends(EmbedBlot, _super);
    	    function EmbedBlot() {
    	        return _super !== null && _super.apply(this, arguments) || this;
    	    }
    	    EmbedBlot.formats = function (domNode) {
    	        return undefined;
    	    };
    	    EmbedBlot.prototype.format = function (name, value) {
    	        // super.formatAt wraps, which is what we want in general,
    	        // but this allows subclasses to overwrite for formats
    	        // that just apply to particular embeds
    	        _super.prototype.formatAt.call(this, 0, this.length(), name, value);
    	    };
    	    EmbedBlot.prototype.formatAt = function (index, length, name, value) {
    	        if (index === 0 && length === this.length()) {
    	            this.format(name, value);
    	        }
    	        else {
    	            _super.prototype.formatAt.call(this, index, length, name, value);
    	        }
    	    };
    	    EmbedBlot.prototype.formats = function () {
    	        return this.statics.formats(this.domNode);
    	    };
    	    return EmbedBlot;
    	}(leaf_1.default));
    	exports.default = EmbedBlot;


    	/***/ }),
    	/* 49 */
    	/***/ (function(module, exports, __webpack_require__) {

    	var __extends = (this && this.__extends) || (function () {
    	    var extendStatics = Object.setPrototypeOf ||
    	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    	    return function (d, b) {
    	        extendStatics(d, b);
    	        function __() { this.constructor = d; }
    	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    	    };
    	})();
    	Object.defineProperty(exports, "__esModule", { value: true });
    	var leaf_1 = __webpack_require__(19);
    	var Registry = __webpack_require__(1);
    	var TextBlot = /** @class */ (function (_super) {
    	    __extends(TextBlot, _super);
    	    function TextBlot(node) {
    	        var _this = _super.call(this, node) || this;
    	        _this.text = _this.statics.value(_this.domNode);
    	        return _this;
    	    }
    	    TextBlot.create = function (value) {
    	        return document.createTextNode(value);
    	    };
    	    TextBlot.value = function (domNode) {
    	        var text = domNode.data;
    	        // @ts-ignore
    	        if (text['normalize'])
    	            text = text['normalize']();
    	        return text;
    	    };
    	    TextBlot.prototype.deleteAt = function (index, length) {
    	        this.domNode.data = this.text = this.text.slice(0, index) + this.text.slice(index + length);
    	    };
    	    TextBlot.prototype.index = function (node, offset) {
    	        if (this.domNode === node) {
    	            return offset;
    	        }
    	        return -1;
    	    };
    	    TextBlot.prototype.insertAt = function (index, value, def) {
    	        if (def == null) {
    	            this.text = this.text.slice(0, index) + value + this.text.slice(index);
    	            this.domNode.data = this.text;
    	        }
    	        else {
    	            _super.prototype.insertAt.call(this, index, value, def);
    	        }
    	    };
    	    TextBlot.prototype.length = function () {
    	        return this.text.length;
    	    };
    	    TextBlot.prototype.optimize = function (context) {
    	        _super.prototype.optimize.call(this, context);
    	        this.text = this.statics.value(this.domNode);
    	        if (this.text.length === 0) {
    	            this.remove();
    	        }
    	        else if (this.next instanceof TextBlot && this.next.prev === this) {
    	            this.insertAt(this.length(), this.next.value());
    	            this.next.remove();
    	        }
    	    };
    	    TextBlot.prototype.position = function (index, inclusive) {
    	        return [this.domNode, index];
    	    };
    	    TextBlot.prototype.split = function (index, force) {
    	        if (force === void 0) { force = false; }
    	        if (!force) {
    	            if (index === 0)
    	                return this;
    	            if (index === this.length())
    	                return this.next;
    	        }
    	        var after = Registry.create(this.domNode.splitText(index));
    	        this.parent.insertBefore(after, this.next);
    	        this.text = this.statics.value(this.domNode);
    	        return after;
    	    };
    	    TextBlot.prototype.update = function (mutations, context) {
    	        var _this = this;
    	        if (mutations.some(function (mutation) {
    	            return mutation.type === 'characterData' && mutation.target === _this.domNode;
    	        })) {
    	            this.text = this.statics.value(this.domNode);
    	        }
    	    };
    	    TextBlot.prototype.value = function () {
    	        return this.text;
    	    };
    	    TextBlot.blotName = 'text';
    	    TextBlot.scope = Registry.Scope.INLINE_BLOT;
    	    return TextBlot;
    	}(leaf_1.default));
    	exports.default = TextBlot;


    	/***/ }),
    	/* 50 */
    	/***/ (function(module, exports, __webpack_require__) {


    	var elem = document.createElement('div');
    	elem.classList.toggle('test-class', false);
    	if (elem.classList.contains('test-class')) {
    	  var _toggle = DOMTokenList.prototype.toggle;
    	  DOMTokenList.prototype.toggle = function (token, force) {
    	    if (arguments.length > 1 && !this.contains(token) === !force) {
    	      return force;
    	    } else {
    	      return _toggle.call(this, token);
    	    }
    	  };
    	}

    	if (!String.prototype.startsWith) {
    	  String.prototype.startsWith = function (searchString, position) {
    	    position = position || 0;
    	    return this.substr(position, searchString.length) === searchString;
    	  };
    	}

    	if (!String.prototype.endsWith) {
    	  String.prototype.endsWith = function (searchString, position) {
    	    var subjectString = this.toString();
    	    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
    	      position = subjectString.length;
    	    }
    	    position -= searchString.length;
    	    var lastIndex = subjectString.indexOf(searchString, position);
    	    return lastIndex !== -1 && lastIndex === position;
    	  };
    	}

    	if (!Array.prototype.find) {
    	  Object.defineProperty(Array.prototype, "find", {
    	    value: function value(predicate) {
    	      if (this === null) {
    	        throw new TypeError('Array.prototype.find called on null or undefined');
    	      }
    	      if (typeof predicate !== 'function') {
    	        throw new TypeError('predicate must be a function');
    	      }
    	      var list = Object(this);
    	      var length = list.length >>> 0;
    	      var thisArg = arguments[1];
    	      var value;

    	      for (var i = 0; i < length; i++) {
    	        value = list[i];
    	        if (predicate.call(thisArg, value, i, list)) {
    	          return value;
    	        }
    	      }
    	      return undefined;
    	    }
    	  });
    	}

    	document.addEventListener("DOMContentLoaded", function () {
    	  // Disable resizing in Firefox
    	  document.execCommand("enableObjectResizing", false, false);
    	  // Disable automatic linkifying in IE11
    	  document.execCommand("autoUrlDetect", false, false);
    	});

    	/***/ }),
    	/* 51 */
    	/***/ (function(module, exports) {

    	/**
    	 * This library modifies the diff-patch-match library by Neil Fraser
    	 * by removing the patch and match functionality and certain advanced
    	 * options in the diff function. The original license is as follows:
    	 *
    	 * ===
    	 *
    	 * Diff Match and Patch
    	 *
    	 * Copyright 2006 Google Inc.
    	 * http://code.google.com/p/google-diff-match-patch/
    	 *
    	 * Licensed under the Apache License, Version 2.0 (the "License");
    	 * you may not use this file except in compliance with the License.
    	 * You may obtain a copy of the License at
    	 *
    	 *   http://www.apache.org/licenses/LICENSE-2.0
    	 *
    	 * Unless required by applicable law or agreed to in writing, software
    	 * distributed under the License is distributed on an "AS IS" BASIS,
    	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    	 * See the License for the specific language governing permissions and
    	 * limitations under the License.
    	 */


    	/**
    	 * The data structure representing a diff is an array of tuples:
    	 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
    	 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
    	 */
    	var DIFF_DELETE = -1;
    	var DIFF_INSERT = 1;
    	var DIFF_EQUAL = 0;


    	/**
    	 * Find the differences between two texts.  Simplifies the problem by stripping
    	 * any common prefix or suffix off the texts before diffing.
    	 * @param {string} text1 Old string to be diffed.
    	 * @param {string} text2 New string to be diffed.
    	 * @param {Int} cursor_pos Expected edit position in text1 (optional)
    	 * @return {Array} Array of diff tuples.
    	 */
    	function diff_main(text1, text2, cursor_pos) {
    	  // Check for equality (speedup).
    	  if (text1 == text2) {
    	    if (text1) {
    	      return [[DIFF_EQUAL, text1]];
    	    }
    	    return [];
    	  }

    	  // Check cursor_pos within bounds
    	  if (cursor_pos < 0 || text1.length < cursor_pos) {
    	    cursor_pos = null;
    	  }

    	  // Trim off common prefix (speedup).
    	  var commonlength = diff_commonPrefix(text1, text2);
    	  var commonprefix = text1.substring(0, commonlength);
    	  text1 = text1.substring(commonlength);
    	  text2 = text2.substring(commonlength);

    	  // Trim off common suffix (speedup).
    	  commonlength = diff_commonSuffix(text1, text2);
    	  var commonsuffix = text1.substring(text1.length - commonlength);
    	  text1 = text1.substring(0, text1.length - commonlength);
    	  text2 = text2.substring(0, text2.length - commonlength);

    	  // Compute the diff on the middle block.
    	  var diffs = diff_compute_(text1, text2);

    	  // Restore the prefix and suffix.
    	  if (commonprefix) {
    	    diffs.unshift([DIFF_EQUAL, commonprefix]);
    	  }
    	  if (commonsuffix) {
    	    diffs.push([DIFF_EQUAL, commonsuffix]);
    	  }
    	  diff_cleanupMerge(diffs);
    	  if (cursor_pos != null) {
    	    diffs = fix_cursor(diffs, cursor_pos);
    	  }
    	  diffs = fix_emoji(diffs);
    	  return diffs;
    	}

    	/**
    	 * Find the differences between two texts.  Assumes that the texts do not
    	 * have any common prefix or suffix.
    	 * @param {string} text1 Old string to be diffed.
    	 * @param {string} text2 New string to be diffed.
    	 * @return {Array} Array of diff tuples.
    	 */
    	function diff_compute_(text1, text2) {
    	  var diffs;

    	  if (!text1) {
    	    // Just add some text (speedup).
    	    return [[DIFF_INSERT, text2]];
    	  }

    	  if (!text2) {
    	    // Just delete some text (speedup).
    	    return [[DIFF_DELETE, text1]];
    	  }

    	  var longtext = text1.length > text2.length ? text1 : text2;
    	  var shorttext = text1.length > text2.length ? text2 : text1;
    	  var i = longtext.indexOf(shorttext);
    	  if (i != -1) {
    	    // Shorter text is inside the longer text (speedup).
    	    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
    	             [DIFF_EQUAL, shorttext],
    	             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
    	    // Swap insertions for deletions if diff is reversed.
    	    if (text1.length > text2.length) {
    	      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    	    }
    	    return diffs;
    	  }

    	  if (shorttext.length == 1) {
    	    // Single character string.
    	    // After the previous speedup, the character can't be an equality.
    	    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    	  }

    	  // Check to see if the problem can be split in two.
    	  var hm = diff_halfMatch_(text1, text2);
    	  if (hm) {
    	    // A half-match was found, sort out the return data.
    	    var text1_a = hm[0];
    	    var text1_b = hm[1];
    	    var text2_a = hm[2];
    	    var text2_b = hm[3];
    	    var mid_common = hm[4];
    	    // Send both pairs off for separate processing.
    	    var diffs_a = diff_main(text1_a, text2_a);
    	    var diffs_b = diff_main(text1_b, text2_b);
    	    // Merge the results.
    	    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
    	  }

    	  return diff_bisect_(text1, text2);
    	}

    	/**
    	 * Find the 'middle snake' of a diff, split the problem in two
    	 * and return the recursively constructed diff.
    	 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
    	 * @param {string} text1 Old string to be diffed.
    	 * @param {string} text2 New string to be diffed.
    	 * @return {Array} Array of diff tuples.
    	 * @private
    	 */
    	function diff_bisect_(text1, text2) {
    	  // Cache the text lengths to prevent multiple calls.
    	  var text1_length = text1.length;
    	  var text2_length = text2.length;
    	  var max_d = Math.ceil((text1_length + text2_length) / 2);
    	  var v_offset = max_d;
    	  var v_length = 2 * max_d;
    	  var v1 = new Array(v_length);
    	  var v2 = new Array(v_length);
    	  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
    	  // integers and undefined.
    	  for (var x = 0; x < v_length; x++) {
    	    v1[x] = -1;
    	    v2[x] = -1;
    	  }
    	  v1[v_offset + 1] = 0;
    	  v2[v_offset + 1] = 0;
    	  var delta = text1_length - text2_length;
    	  // If the total number of characters is odd, then the front path will collide
    	  // with the reverse path.
    	  var front = (delta % 2 != 0);
    	  // Offsets for start and end of k loop.
    	  // Prevents mapping of space beyond the grid.
    	  var k1start = 0;
    	  var k1end = 0;
    	  var k2start = 0;
    	  var k2end = 0;
    	  for (var d = 0; d < max_d; d++) {
    	    // Walk the front path one step.
    	    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
    	      var k1_offset = v_offset + k1;
    	      var x1;
    	      if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
    	        x1 = v1[k1_offset + 1];
    	      } else {
    	        x1 = v1[k1_offset - 1] + 1;
    	      }
    	      var y1 = x1 - k1;
    	      while (x1 < text1_length && y1 < text2_length &&
    	             text1.charAt(x1) == text2.charAt(y1)) {
    	        x1++;
    	        y1++;
    	      }
    	      v1[k1_offset] = x1;
    	      if (x1 > text1_length) {
    	        // Ran off the right of the graph.
    	        k1end += 2;
    	      } else if (y1 > text2_length) {
    	        // Ran off the bottom of the graph.
    	        k1start += 2;
    	      } else if (front) {
    	        var k2_offset = v_offset + delta - k1;
    	        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
    	          // Mirror x2 onto top-left coordinate system.
    	          var x2 = text1_length - v2[k2_offset];
    	          if (x1 >= x2) {
    	            // Overlap detected.
    	            return diff_bisectSplit_(text1, text2, x1, y1);
    	          }
    	        }
    	      }
    	    }

    	    // Walk the reverse path one step.
    	    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
    	      var k2_offset = v_offset + k2;
    	      var x2;
    	      if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
    	        x2 = v2[k2_offset + 1];
    	      } else {
    	        x2 = v2[k2_offset - 1] + 1;
    	      }
    	      var y2 = x2 - k2;
    	      while (x2 < text1_length && y2 < text2_length &&
    	             text1.charAt(text1_length - x2 - 1) ==
    	             text2.charAt(text2_length - y2 - 1)) {
    	        x2++;
    	        y2++;
    	      }
    	      v2[k2_offset] = x2;
    	      if (x2 > text1_length) {
    	        // Ran off the left of the graph.
    	        k2end += 2;
    	      } else if (y2 > text2_length) {
    	        // Ran off the top of the graph.
    	        k2start += 2;
    	      } else if (!front) {
    	        var k1_offset = v_offset + delta - k2;
    	        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
    	          var x1 = v1[k1_offset];
    	          var y1 = v_offset + x1 - k1_offset;
    	          // Mirror x2 onto top-left coordinate system.
    	          x2 = text1_length - x2;
    	          if (x1 >= x2) {
    	            // Overlap detected.
    	            return diff_bisectSplit_(text1, text2, x1, y1);
    	          }
    	        }
    	      }
    	    }
    	  }
    	  // Diff took too long and hit the deadline or
    	  // number of diffs equals number of characters, no commonality at all.
    	  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    	}

    	/**
    	 * Given the location of the 'middle snake', split the diff in two parts
    	 * and recurse.
    	 * @param {string} text1 Old string to be diffed.
    	 * @param {string} text2 New string to be diffed.
    	 * @param {number} x Index of split point in text1.
    	 * @param {number} y Index of split point in text2.
    	 * @return {Array} Array of diff tuples.
    	 */
    	function diff_bisectSplit_(text1, text2, x, y) {
    	  var text1a = text1.substring(0, x);
    	  var text2a = text2.substring(0, y);
    	  var text1b = text1.substring(x);
    	  var text2b = text2.substring(y);

    	  // Compute both diffs serially.
    	  var diffs = diff_main(text1a, text2a);
    	  var diffsb = diff_main(text1b, text2b);

    	  return diffs.concat(diffsb);
    	}

    	/**
    	 * Determine the common prefix of two strings.
    	 * @param {string} text1 First string.
    	 * @param {string} text2 Second string.
    	 * @return {number} The number of characters common to the start of each
    	 *     string.
    	 */
    	function diff_commonPrefix(text1, text2) {
    	  // Quick check for common null cases.
    	  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
    	    return 0;
    	  }
    	  // Binary search.
    	  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    	  var pointermin = 0;
    	  var pointermax = Math.min(text1.length, text2.length);
    	  var pointermid = pointermax;
    	  var pointerstart = 0;
    	  while (pointermin < pointermid) {
    	    if (text1.substring(pointerstart, pointermid) ==
    	        text2.substring(pointerstart, pointermid)) {
    	      pointermin = pointermid;
    	      pointerstart = pointermin;
    	    } else {
    	      pointermax = pointermid;
    	    }
    	    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    	  }
    	  return pointermid;
    	}

    	/**
    	 * Determine the common suffix of two strings.
    	 * @param {string} text1 First string.
    	 * @param {string} text2 Second string.
    	 * @return {number} The number of characters common to the end of each string.
    	 */
    	function diff_commonSuffix(text1, text2) {
    	  // Quick check for common null cases.
    	  if (!text1 || !text2 ||
    	      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
    	    return 0;
    	  }
    	  // Binary search.
    	  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    	  var pointermin = 0;
    	  var pointermax = Math.min(text1.length, text2.length);
    	  var pointermid = pointermax;
    	  var pointerend = 0;
    	  while (pointermin < pointermid) {
    	    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
    	        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
    	      pointermin = pointermid;
    	      pointerend = pointermin;
    	    } else {
    	      pointermax = pointermid;
    	    }
    	    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    	  }
    	  return pointermid;
    	}

    	/**
    	 * Do the two texts share a substring which is at least half the length of the
    	 * longer text?
    	 * This speedup can produce non-minimal diffs.
    	 * @param {string} text1 First string.
    	 * @param {string} text2 Second string.
    	 * @return {Array.<string>} Five element Array, containing the prefix of
    	 *     text1, the suffix of text1, the prefix of text2, the suffix of
    	 *     text2 and the common middle.  Or null if there was no match.
    	 */
    	function diff_halfMatch_(text1, text2) {
    	  var longtext = text1.length > text2.length ? text1 : text2;
    	  var shorttext = text1.length > text2.length ? text2 : text1;
    	  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    	    return null;  // Pointless.
    	  }

    	  /**
    	   * Does a substring of shorttext exist within longtext such that the substring
    	   * is at least half the length of longtext?
    	   * Closure, but does not reference any external variables.
    	   * @param {string} longtext Longer string.
    	   * @param {string} shorttext Shorter string.
    	   * @param {number} i Start index of quarter length substring within longtext.
    	   * @return {Array.<string>} Five element Array, containing the prefix of
    	   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
    	   *     of shorttext and the common middle.  Or null if there was no match.
    	   * @private
    	   */
    	  function diff_halfMatchI_(longtext, shorttext, i) {
    	    // Start with a 1/4 length substring at position i as a seed.
    	    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    	    var j = -1;
    	    var best_common = '';
    	    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    	    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
    	      var prefixLength = diff_commonPrefix(longtext.substring(i),
    	                                           shorttext.substring(j));
    	      var suffixLength = diff_commonSuffix(longtext.substring(0, i),
    	                                           shorttext.substring(0, j));
    	      if (best_common.length < suffixLength + prefixLength) {
    	        best_common = shorttext.substring(j - suffixLength, j) +
    	            shorttext.substring(j, j + prefixLength);
    	        best_longtext_a = longtext.substring(0, i - suffixLength);
    	        best_longtext_b = longtext.substring(i + prefixLength);
    	        best_shorttext_a = shorttext.substring(0, j - suffixLength);
    	        best_shorttext_b = shorttext.substring(j + prefixLength);
    	      }
    	    }
    	    if (best_common.length * 2 >= longtext.length) {
    	      return [best_longtext_a, best_longtext_b,
    	              best_shorttext_a, best_shorttext_b, best_common];
    	    } else {
    	      return null;
    	    }
    	  }

    	  // First check if the second quarter is the seed for a half-match.
    	  var hm1 = diff_halfMatchI_(longtext, shorttext,
    	                             Math.ceil(longtext.length / 4));
    	  // Check again based on the third quarter.
    	  var hm2 = diff_halfMatchI_(longtext, shorttext,
    	                             Math.ceil(longtext.length / 2));
    	  var hm;
    	  if (!hm1 && !hm2) {
    	    return null;
    	  } else if (!hm2) {
    	    hm = hm1;
    	  } else if (!hm1) {
    	    hm = hm2;
    	  } else {
    	    // Both matched.  Select the longest.
    	    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
    	  }

    	  // A half-match was found, sort out the return data.
    	  var text1_a, text1_b, text2_a, text2_b;
    	  if (text1.length > text2.length) {
    	    text1_a = hm[0];
    	    text1_b = hm[1];
    	    text2_a = hm[2];
    	    text2_b = hm[3];
    	  } else {
    	    text2_a = hm[0];
    	    text2_b = hm[1];
    	    text1_a = hm[2];
    	    text1_b = hm[3];
    	  }
    	  var mid_common = hm[4];
    	  return [text1_a, text1_b, text2_a, text2_b, mid_common];
    	}

    	/**
    	 * Reorder and merge like edit sections.  Merge equalities.
    	 * Any edit section can move as long as it doesn't cross an equality.
    	 * @param {Array} diffs Array of diff tuples.
    	 */
    	function diff_cleanupMerge(diffs) {
    	  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
    	  var pointer = 0;
    	  var count_delete = 0;
    	  var count_insert = 0;
    	  var text_delete = '';
    	  var text_insert = '';
    	  var commonlength;
    	  while (pointer < diffs.length) {
    	    switch (diffs[pointer][0]) {
    	      case DIFF_INSERT:
    	        count_insert++;
    	        text_insert += diffs[pointer][1];
    	        pointer++;
    	        break;
    	      case DIFF_DELETE:
    	        count_delete++;
    	        text_delete += diffs[pointer][1];
    	        pointer++;
    	        break;
    	      case DIFF_EQUAL:
    	        // Upon reaching an equality, check for prior redundancies.
    	        if (count_delete + count_insert > 1) {
    	          if (count_delete !== 0 && count_insert !== 0) {
    	            // Factor out any common prefixies.
    	            commonlength = diff_commonPrefix(text_insert, text_delete);
    	            if (commonlength !== 0) {
    	              if ((pointer - count_delete - count_insert) > 0 &&
    	                  diffs[pointer - count_delete - count_insert - 1][0] ==
    	                  DIFF_EQUAL) {
    	                diffs[pointer - count_delete - count_insert - 1][1] +=
    	                    text_insert.substring(0, commonlength);
    	              } else {
    	                diffs.splice(0, 0, [DIFF_EQUAL,
    	                                    text_insert.substring(0, commonlength)]);
    	                pointer++;
    	              }
    	              text_insert = text_insert.substring(commonlength);
    	              text_delete = text_delete.substring(commonlength);
    	            }
    	            // Factor out any common suffixies.
    	            commonlength = diff_commonSuffix(text_insert, text_delete);
    	            if (commonlength !== 0) {
    	              diffs[pointer][1] = text_insert.substring(text_insert.length -
    	                  commonlength) + diffs[pointer][1];
    	              text_insert = text_insert.substring(0, text_insert.length -
    	                  commonlength);
    	              text_delete = text_delete.substring(0, text_delete.length -
    	                  commonlength);
    	            }
    	          }
    	          // Delete the offending records and add the merged ones.
    	          if (count_delete === 0) {
    	            diffs.splice(pointer - count_insert,
    	                count_delete + count_insert, [DIFF_INSERT, text_insert]);
    	          } else if (count_insert === 0) {
    	            diffs.splice(pointer - count_delete,
    	                count_delete + count_insert, [DIFF_DELETE, text_delete]);
    	          } else {
    	            diffs.splice(pointer - count_delete - count_insert,
    	                count_delete + count_insert, [DIFF_DELETE, text_delete],
    	                [DIFF_INSERT, text_insert]);
    	          }
    	          pointer = pointer - count_delete - count_insert +
    	                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
    	        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
    	          // Merge this equality with the previous one.
    	          diffs[pointer - 1][1] += diffs[pointer][1];
    	          diffs.splice(pointer, 1);
    	        } else {
    	          pointer++;
    	        }
    	        count_insert = 0;
    	        count_delete = 0;
    	        text_delete = '';
    	        text_insert = '';
    	        break;
    	    }
    	  }
    	  if (diffs[diffs.length - 1][1] === '') {
    	    diffs.pop();  // Remove the dummy entry at the end.
    	  }

    	  // Second pass: look for single edits surrounded on both sides by equalities
    	  // which can be shifted sideways to eliminate an equality.
    	  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
    	  var changes = false;
    	  pointer = 1;
    	  // Intentionally ignore the first and last element (don't need checking).
    	  while (pointer < diffs.length - 1) {
    	    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
    	        diffs[pointer + 1][0] == DIFF_EQUAL) {
    	      // This is a single edit surrounded by equalities.
    	      if (diffs[pointer][1].substring(diffs[pointer][1].length -
    	          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
    	        // Shift the edit over the previous equality.
    	        diffs[pointer][1] = diffs[pointer - 1][1] +
    	            diffs[pointer][1].substring(0, diffs[pointer][1].length -
    	                                        diffs[pointer - 1][1].length);
    	        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
    	        diffs.splice(pointer - 1, 1);
    	        changes = true;
    	      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
    	          diffs[pointer + 1][1]) {
    	        // Shift the edit over the next equality.
    	        diffs[pointer - 1][1] += diffs[pointer + 1][1];
    	        diffs[pointer][1] =
    	            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
    	            diffs[pointer + 1][1];
    	        diffs.splice(pointer + 1, 1);
    	        changes = true;
    	      }
    	    }
    	    pointer++;
    	  }
    	  // If shifts were made, the diff needs reordering and another shift sweep.
    	  if (changes) {
    	    diff_cleanupMerge(diffs);
    	  }
    	}

    	var diff = diff_main;
    	diff.INSERT = DIFF_INSERT;
    	diff.DELETE = DIFF_DELETE;
    	diff.EQUAL = DIFF_EQUAL;

    	module.exports = diff;

    	/*
    	 * Modify a diff such that the cursor position points to the start of a change:
    	 * E.g.
    	 *   cursor_normalize_diff([[DIFF_EQUAL, 'abc']], 1)
    	 *     => [1, [[DIFF_EQUAL, 'a'], [DIFF_EQUAL, 'bc']]]
    	 *   cursor_normalize_diff([[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xyz']], 2)
    	 *     => [2, [[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xy'], [DIFF_DELETE, 'z']]]
    	 *
    	 * @param {Array} diffs Array of diff tuples
    	 * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
    	 * @return {Array} A tuple [cursor location in the modified diff, modified diff]
    	 */
    	function cursor_normalize_diff (diffs, cursor_pos) {
    	  if (cursor_pos === 0) {
    	    return [DIFF_EQUAL, diffs];
    	  }
    	  for (var current_pos = 0, i = 0; i < diffs.length; i++) {
    	    var d = diffs[i];
    	    if (d[0] === DIFF_DELETE || d[0] === DIFF_EQUAL) {
    	      var next_pos = current_pos + d[1].length;
    	      if (cursor_pos === next_pos) {
    	        return [i + 1, diffs];
    	      } else if (cursor_pos < next_pos) {
    	        // copy to prevent side effects
    	        diffs = diffs.slice();
    	        // split d into two diff changes
    	        var split_pos = cursor_pos - current_pos;
    	        var d_left = [d[0], d[1].slice(0, split_pos)];
    	        var d_right = [d[0], d[1].slice(split_pos)];
    	        diffs.splice(i, 1, d_left, d_right);
    	        return [i + 1, diffs];
    	      } else {
    	        current_pos = next_pos;
    	      }
    	    }
    	  }
    	  throw new Error('cursor_pos is out of bounds!')
    	}

    	/*
    	 * Modify a diff such that the edit position is "shifted" to the proposed edit location (cursor_position).
    	 *
    	 * Case 1)
    	 *   Check if a naive shift is possible:
    	 *     [0, X], [ 1, Y] -> [ 1, Y], [0, X]    (if X + Y === Y + X)
    	 *     [0, X], [-1, Y] -> [-1, Y], [0, X]    (if X + Y === Y + X) - holds same result
    	 * Case 2)
    	 *   Check if the following shifts are possible:
    	 *     [0, 'pre'], [ 1, 'prefix'] -> [ 1, 'pre'], [0, 'pre'], [ 1, 'fix']
    	 *     [0, 'pre'], [-1, 'prefix'] -> [-1, 'pre'], [0, 'pre'], [-1, 'fix']
    	 *         ^            ^
    	 *         d          d_next
    	 *
    	 * @param {Array} diffs Array of diff tuples
    	 * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
    	 * @return {Array} Array of diff tuples
    	 */
    	function fix_cursor (diffs, cursor_pos) {
    	  var norm = cursor_normalize_diff(diffs, cursor_pos);
    	  var ndiffs = norm[1];
    	  var cursor_pointer = norm[0];
    	  var d = ndiffs[cursor_pointer];
    	  var d_next = ndiffs[cursor_pointer + 1];

    	  if (d == null) {
    	    // Text was deleted from end of original string,
    	    // cursor is now out of bounds in new string
    	    return diffs;
    	  } else if (d[0] !== DIFF_EQUAL) {
    	    // A modification happened at the cursor location.
    	    // This is the expected outcome, so we can return the original diff.
    	    return diffs;
    	  } else {
    	    if (d_next != null && d[1] + d_next[1] === d_next[1] + d[1]) {
    	      // Case 1)
    	      // It is possible to perform a naive shift
    	      ndiffs.splice(cursor_pointer, 2, d_next, d);
    	      return merge_tuples(ndiffs, cursor_pointer, 2)
    	    } else if (d_next != null && d_next[1].indexOf(d[1]) === 0) {
    	      // Case 2)
    	      // d[1] is a prefix of d_next[1]
    	      // We can assume that d_next[0] !== 0, since d[0] === 0
    	      // Shift edit locations..
    	      ndiffs.splice(cursor_pointer, 2, [d_next[0], d[1]], [0, d[1]]);
    	      var suffix = d_next[1].slice(d[1].length);
    	      if (suffix.length > 0) {
    	        ndiffs.splice(cursor_pointer + 2, 0, [d_next[0], suffix]);
    	      }
    	      return merge_tuples(ndiffs, cursor_pointer, 3)
    	    } else {
    	      // Not possible to perform any modification
    	      return diffs;
    	    }
    	  }
    	}

    	/*
    	 * Check diff did not split surrogate pairs.
    	 * Ex. [0, '\uD83D'], [-1, '\uDC36'], [1, '\uDC2F'] -> [-1, '\uD83D\uDC36'], [1, '\uD83D\uDC2F']
    	 *     '\uD83D\uDC36' === '🐶', '\uD83D\uDC2F' === '🐯'
    	 *
    	 * @param {Array} diffs Array of diff tuples
    	 * @return {Array} Array of diff tuples
    	 */
    	function fix_emoji (diffs) {
    	  var compact = false;
    	  var starts_with_pair_end = function(str) {
    	    return str.charCodeAt(0) >= 0xDC00 && str.charCodeAt(0) <= 0xDFFF;
    	  };
    	  var ends_with_pair_start = function(str) {
    	    return str.charCodeAt(str.length-1) >= 0xD800 && str.charCodeAt(str.length-1) <= 0xDBFF;
    	  };
    	  for (var i = 2; i < diffs.length; i += 1) {
    	    if (diffs[i-2][0] === DIFF_EQUAL && ends_with_pair_start(diffs[i-2][1]) &&
    	        diffs[i-1][0] === DIFF_DELETE && starts_with_pair_end(diffs[i-1][1]) &&
    	        diffs[i][0] === DIFF_INSERT && starts_with_pair_end(diffs[i][1])) {
    	      compact = true;

    	      diffs[i-1][1] = diffs[i-2][1].slice(-1) + diffs[i-1][1];
    	      diffs[i][1] = diffs[i-2][1].slice(-1) + diffs[i][1];

    	      diffs[i-2][1] = diffs[i-2][1].slice(0, -1);
    	    }
    	  }
    	  if (!compact) {
    	    return diffs;
    	  }
    	  var fixed_diffs = [];
    	  for (var i = 0; i < diffs.length; i += 1) {
    	    if (diffs[i][1].length > 0) {
    	      fixed_diffs.push(diffs[i]);
    	    }
    	  }
    	  return fixed_diffs;
    	}

    	/*
    	 * Try to merge tuples with their neigbors in a given range.
    	 * E.g. [0, 'a'], [0, 'b'] -> [0, 'ab']
    	 *
    	 * @param {Array} diffs Array of diff tuples.
    	 * @param {Int} start Position of the first element to merge (diffs[start] is also merged with diffs[start - 1]).
    	 * @param {Int} length Number of consecutive elements to check.
    	 * @return {Array} Array of merged diff tuples.
    	 */
    	function merge_tuples (diffs, start, length) {
    	  // Check from (start-1) to (start+length).
    	  for (var i = start + length - 1; i >= 0 && i >= start - 1; i--) {
    	    if (i + 1 < diffs.length) {
    	      var left_d = diffs[i];
    	      var right_d = diffs[i+1];
    	      if (left_d[0] === right_d[1]) {
    	        diffs.splice(i, 2, [left_d[0], left_d[1] + right_d[1]]);
    	      }
    	    }
    	  }
    	  return diffs;
    	}


    	/***/ }),
    	/* 52 */
    	/***/ (function(module, exports) {

    	exports = module.exports = typeof Object.keys === 'function'
    	  ? Object.keys : shim;

    	exports.shim = shim;
    	function shim (obj) {
    	  var keys = [];
    	  for (var key in obj) keys.push(key);
    	  return keys;
    	}


    	/***/ }),
    	/* 53 */
    	/***/ (function(module, exports) {

    	var supportsArgumentsClass = (function(){
    	  return Object.prototype.toString.call(arguments)
    	})() == '[object Arguments]';

    	exports = module.exports = supportsArgumentsClass ? supported : unsupported;

    	exports.supported = supported;
    	function supported(object) {
    	  return Object.prototype.toString.call(object) == '[object Arguments]';
    	}
    	exports.unsupported = unsupported;
    	function unsupported(object){
    	  return object &&
    	    typeof object == 'object' &&
    	    typeof object.length == 'number' &&
    	    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    	    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    	    false;
    	}

    	/***/ }),
    	/* 54 */
    	/***/ (function(module, exports) {

    	var has = Object.prototype.hasOwnProperty
    	  , prefix = '~';

    	/**
    	 * Constructor to create a storage for our `EE` objects.
    	 * An `Events` instance is a plain object whose properties are event names.
    	 *
    	 * @constructor
    	 * @api private
    	 */
    	function Events() {}

    	//
    	// We try to not inherit from `Object.prototype`. In some engines creating an
    	// instance in this way is faster than calling `Object.create(null)` directly.
    	// If `Object.create(null)` is not supported we prefix the event names with a
    	// character to make sure that the built-in object properties are not
    	// overridden or used as an attack vector.
    	//
    	if (Object.create) {
    	  Events.prototype = Object.create(null);

    	  //
    	  // This hack is needed because the `__proto__` property is still inherited in
    	  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    	  //
    	  if (!new Events().__proto__) prefix = false;
    	}

    	/**
    	 * Representation of a single event listener.
    	 *
    	 * @param {Function} fn The listener function.
    	 * @param {Mixed} context The context to invoke the listener with.
    	 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
    	 * @constructor
    	 * @api private
    	 */
    	function EE(fn, context, once) {
    	  this.fn = fn;
    	  this.context = context;
    	  this.once = once || false;
    	}

    	/**
    	 * Minimal `EventEmitter` interface that is molded against the Node.js
    	 * `EventEmitter` interface.
    	 *
    	 * @constructor
    	 * @api public
    	 */
    	function EventEmitter() {
    	  this._events = new Events();
    	  this._eventsCount = 0;
    	}

    	/**
    	 * Return an array listing the events for which the emitter has registered
    	 * listeners.
    	 *
    	 * @returns {Array}
    	 * @api public
    	 */
    	EventEmitter.prototype.eventNames = function eventNames() {
    	  var names = []
    	    , events
    	    , name;

    	  if (this._eventsCount === 0) return names;

    	  for (name in (events = this._events)) {
    	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    	  }

    	  if (Object.getOwnPropertySymbols) {
    	    return names.concat(Object.getOwnPropertySymbols(events));
    	  }

    	  return names;
    	};

    	/**
    	 * Return the listeners registered for a given event.
    	 *
    	 * @param {String|Symbol} event The event name.
    	 * @param {Boolean} exists Only check if there are listeners.
    	 * @returns {Array|Boolean}
    	 * @api public
    	 */
    	EventEmitter.prototype.listeners = function listeners(event, exists) {
    	  var evt = prefix ? prefix + event : event
    	    , available = this._events[evt];

    	  if (exists) return !!available;
    	  if (!available) return [];
    	  if (available.fn) return [available.fn];

    	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    	    ee[i] = available[i].fn;
    	  }

    	  return ee;
    	};

    	/**
    	 * Calls each of the listeners registered for a given event.
    	 *
    	 * @param {String|Symbol} event The event name.
    	 * @returns {Boolean} `true` if the event had listeners, else `false`.
    	 * @api public
    	 */
    	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    	  var evt = prefix ? prefix + event : event;

    	  if (!this._events[evt]) return false;

    	  var listeners = this._events[evt]
    	    , len = arguments.length
    	    , args
    	    , i;

    	  if (listeners.fn) {
    	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    	    switch (len) {
    	      case 1: return listeners.fn.call(listeners.context), true;
    	      case 2: return listeners.fn.call(listeners.context, a1), true;
    	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
    	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
    	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
    	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    	    }

    	    for (i = 1, args = new Array(len -1); i < len; i++) {
    	      args[i - 1] = arguments[i];
    	    }

    	    listeners.fn.apply(listeners.context, args);
    	  } else {
    	    var length = listeners.length
    	      , j;

    	    for (i = 0; i < length; i++) {
    	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

    	      switch (len) {
    	        case 1: listeners[i].fn.call(listeners[i].context); break;
    	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
    	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
    	        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
    	        default:
    	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
    	            args[j - 1] = arguments[j];
    	          }

    	          listeners[i].fn.apply(listeners[i].context, args);
    	      }
    	    }
    	  }

    	  return true;
    	};

    	/**
    	 * Add a listener for a given event.
    	 *
    	 * @param {String|Symbol} event The event name.
    	 * @param {Function} fn The listener function.
    	 * @param {Mixed} [context=this] The context to invoke the listener with.
    	 * @returns {EventEmitter} `this`.
    	 * @api public
    	 */
    	EventEmitter.prototype.on = function on(event, fn, context) {
    	  var listener = new EE(fn, context || this)
    	    , evt = prefix ? prefix + event : event;

    	  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
    	  else if (!this._events[evt].fn) this._events[evt].push(listener);
    	  else this._events[evt] = [this._events[evt], listener];

    	  return this;
    	};

    	/**
    	 * Add a one-time listener for a given event.
    	 *
    	 * @param {String|Symbol} event The event name.
    	 * @param {Function} fn The listener function.
    	 * @param {Mixed} [context=this] The context to invoke the listener with.
    	 * @returns {EventEmitter} `this`.
    	 * @api public
    	 */
    	EventEmitter.prototype.once = function once(event, fn, context) {
    	  var listener = new EE(fn, context || this, true)
    	    , evt = prefix ? prefix + event : event;

    	  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
    	  else if (!this._events[evt].fn) this._events[evt].push(listener);
    	  else this._events[evt] = [this._events[evt], listener];

    	  return this;
    	};

    	/**
    	 * Remove the listeners of a given event.
    	 *
    	 * @param {String|Symbol} event The event name.
    	 * @param {Function} fn Only remove the listeners that match this function.
    	 * @param {Mixed} context Only remove the listeners that have this context.
    	 * @param {Boolean} once Only remove one-time listeners.
    	 * @returns {EventEmitter} `this`.
    	 * @api public
    	 */
    	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    	  var evt = prefix ? prefix + event : event;

    	  if (!this._events[evt]) return this;
    	  if (!fn) {
    	    if (--this._eventsCount === 0) this._events = new Events();
    	    else delete this._events[evt];
    	    return this;
    	  }

    	  var listeners = this._events[evt];

    	  if (listeners.fn) {
    	    if (
    	         listeners.fn === fn
    	      && (!once || listeners.once)
    	      && (!context || listeners.context === context)
    	    ) {
    	      if (--this._eventsCount === 0) this._events = new Events();
    	      else delete this._events[evt];
    	    }
    	  } else {
    	    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
    	      if (
    	           listeners[i].fn !== fn
    	        || (once && !listeners[i].once)
    	        || (context && listeners[i].context !== context)
    	      ) {
    	        events.push(listeners[i]);
    	      }
    	    }

    	    //
    	    // Reset the array, or remove it completely if we have no more listeners.
    	    //
    	    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    	    else if (--this._eventsCount === 0) this._events = new Events();
    	    else delete this._events[evt];
    	  }

    	  return this;
    	};

    	/**
    	 * Remove all listeners, or those of the specified event.
    	 *
    	 * @param {String|Symbol} [event] The event name.
    	 * @returns {EventEmitter} `this`.
    	 * @api public
    	 */
    	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    	  var evt;

    	  if (event) {
    	    evt = prefix ? prefix + event : event;
    	    if (this._events[evt]) {
    	      if (--this._eventsCount === 0) this._events = new Events();
    	      else delete this._events[evt];
    	    }
    	  } else {
    	    this._events = new Events();
    	    this._eventsCount = 0;
    	  }

    	  return this;
    	};

    	//
    	// Alias methods names because people roll like that.
    	//
    	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    	//
    	// This function doesn't apply anymore.
    	//
    	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    	  return this;
    	};

    	//
    	// Expose the prefix.
    	//
    	EventEmitter.prefixed = prefix;

    	//
    	// Allow `EventEmitter` to be imported as module namespace.
    	//
    	EventEmitter.EventEmitter = EventEmitter;

    	//
    	// Expose the module.
    	//
    	if ('undefined' !== typeof module) {
    	  module.exports = EventEmitter;
    	}


    	/***/ }),
    	/* 55 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.matchText = exports.matchSpacing = exports.matchNewline = exports.matchBlot = exports.matchAttributor = exports.default = undefined;

    	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _extend2 = __webpack_require__(3);

    	var _extend3 = _interopRequireDefault(_extend2);

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _logger = __webpack_require__(10);

    	var _logger2 = _interopRequireDefault(_logger);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	var _align = __webpack_require__(36);

    	var _background = __webpack_require__(37);

    	var _code = __webpack_require__(13);

    	var _code2 = _interopRequireDefault(_code);

    	var _color = __webpack_require__(26);

    	var _direction = __webpack_require__(38);

    	var _font = __webpack_require__(39);

    	var _size = __webpack_require__(40);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var debug = (0, _logger2.default)('quill:clipboard');

    	var DOM_KEY = '__ql-matcher';

    	var CLIPBOARD_CONFIG = [[Node.TEXT_NODE, matchText], [Node.TEXT_NODE, matchNewline], ['br', matchBreak], [Node.ELEMENT_NODE, matchNewline], [Node.ELEMENT_NODE, matchBlot], [Node.ELEMENT_NODE, matchSpacing], [Node.ELEMENT_NODE, matchAttributor], [Node.ELEMENT_NODE, matchStyles], ['li', matchIndent], ['b', matchAlias.bind(matchAlias, 'bold')], ['i', matchAlias.bind(matchAlias, 'italic')], ['style', matchIgnore]];

    	var ATTRIBUTE_ATTRIBUTORS = [_align.AlignAttribute, _direction.DirectionAttribute].reduce(function (memo, attr) {
    	  memo[attr.keyName] = attr;
    	  return memo;
    	}, {});

    	var STYLE_ATTRIBUTORS = [_align.AlignStyle, _background.BackgroundStyle, _color.ColorStyle, _direction.DirectionStyle, _font.FontStyle, _size.SizeStyle].reduce(function (memo, attr) {
    	  memo[attr.keyName] = attr;
    	  return memo;
    	}, {});

    	var Clipboard = function (_Module) {
    	  _inherits(Clipboard, _Module);

    	  function Clipboard(quill, options) {
    	    _classCallCheck(this, Clipboard);

    	    var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this, quill, options));

    	    _this.quill.root.addEventListener('paste', _this.onPaste.bind(_this));
    	    _this.container = _this.quill.addContainer('ql-clipboard');
    	    _this.container.setAttribute('contenteditable', true);
    	    _this.container.setAttribute('tabindex', -1);
    	    _this.matchers = [];
    	    CLIPBOARD_CONFIG.concat(_this.options.matchers).forEach(function (_ref) {
    	      var _ref2 = _slicedToArray(_ref, 2),
    	          selector = _ref2[0],
    	          matcher = _ref2[1];

    	      if (!options.matchVisual && matcher === matchSpacing) return;
    	      _this.addMatcher(selector, matcher);
    	    });
    	    return _this;
    	  }

    	  _createClass(Clipboard, [{
    	    key: 'addMatcher',
    	    value: function addMatcher(selector, matcher) {
    	      this.matchers.push([selector, matcher]);
    	    }
    	  }, {
    	    key: 'convert',
    	    value: function convert(html) {
    	      if (typeof html === 'string') {
    	        this.container.innerHTML = html.replace(/\>\r?\n +\</g, '><'); // Remove spaces between tags
    	        return this.convert();
    	      }
    	      var formats = this.quill.getFormat(this.quill.selection.savedRange.index);
    	      if (formats[_code2.default.blotName]) {
    	        var text = this.container.innerText;
    	        this.container.innerHTML = '';
    	        return new _quillDelta2.default().insert(text, _defineProperty({}, _code2.default.blotName, formats[_code2.default.blotName]));
    	      }

    	      var _prepareMatching = this.prepareMatching(),
    	          _prepareMatching2 = _slicedToArray(_prepareMatching, 2),
    	          elementMatchers = _prepareMatching2[0],
    	          textMatchers = _prepareMatching2[1];

    	      var delta = traverse(this.container, elementMatchers, textMatchers);
    	      // Remove trailing newline
    	      if (deltaEndsWith(delta, '\n') && delta.ops[delta.ops.length - 1].attributes == null) {
    	        delta = delta.compose(new _quillDelta2.default().retain(delta.length() - 1).delete(1));
    	      }
    	      debug.log('convert', this.container.innerHTML, delta);
    	      this.container.innerHTML = '';
    	      return delta;
    	    }
    	  }, {
    	    key: 'dangerouslyPasteHTML',
    	    value: function dangerouslyPasteHTML(index, html) {
    	      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _quill2.default.sources.API;

    	      if (typeof index === 'string') {
    	        this.quill.setContents(this.convert(index), html);
    	        this.quill.setSelection(0, _quill2.default.sources.SILENT);
    	      } else {
    	        var paste = this.convert(html);
    	        this.quill.updateContents(new _quillDelta2.default().retain(index).concat(paste), source);
    	        this.quill.setSelection(index + paste.length(), _quill2.default.sources.SILENT);
    	      }
    	    }
    	  }, {
    	    key: 'onPaste',
    	    value: function onPaste(e) {
    	      var _this2 = this;

    	      if (e.defaultPrevented || !this.quill.isEnabled()) return;
    	      var range = this.quill.getSelection();
    	      var delta = new _quillDelta2.default().retain(range.index);
    	      var scrollTop = this.quill.scrollingContainer.scrollTop;
    	      this.container.focus();
    	      this.quill.selection.update(_quill2.default.sources.SILENT);
    	      setTimeout(function () {
    	        delta = delta.concat(_this2.convert()).delete(range.length);
    	        _this2.quill.updateContents(delta, _quill2.default.sources.USER);
    	        // range.length contributes to delta.length()
    	        _this2.quill.setSelection(delta.length() - range.length, _quill2.default.sources.SILENT);
    	        _this2.quill.scrollingContainer.scrollTop = scrollTop;
    	        _this2.quill.focus();
    	      }, 1);
    	    }
    	  }, {
    	    key: 'prepareMatching',
    	    value: function prepareMatching() {
    	      var _this3 = this;

    	      var elementMatchers = [],
    	          textMatchers = [];
    	      this.matchers.forEach(function (pair) {
    	        var _pair = _slicedToArray(pair, 2),
    	            selector = _pair[0],
    	            matcher = _pair[1];

    	        switch (selector) {
    	          case Node.TEXT_NODE:
    	            textMatchers.push(matcher);
    	            break;
    	          case Node.ELEMENT_NODE:
    	            elementMatchers.push(matcher);
    	            break;
    	          default:
    	            [].forEach.call(_this3.container.querySelectorAll(selector), function (node) {
    	              // TODO use weakmap
    	              node[DOM_KEY] = node[DOM_KEY] || [];
    	              node[DOM_KEY].push(matcher);
    	            });
    	            break;
    	        }
    	      });
    	      return [elementMatchers, textMatchers];
    	    }
    	  }]);

    	  return Clipboard;
    	}(_module2.default);

    	Clipboard.DEFAULTS = {
    	  matchers: [],
    	  matchVisual: true
    	};

    	function applyFormat(delta, format, value) {
    	  if ((typeof format === 'undefined' ? 'undefined' : _typeof(format)) === 'object') {
    	    return Object.keys(format).reduce(function (delta, key) {
    	      return applyFormat(delta, key, format[key]);
    	    }, delta);
    	  } else {
    	    return delta.reduce(function (delta, op) {
    	      if (op.attributes && op.attributes[format]) {
    	        return delta.push(op);
    	      } else {
    	        return delta.insert(op.insert, (0, _extend3.default)({}, _defineProperty({}, format, value), op.attributes));
    	      }
    	    }, new _quillDelta2.default());
    	  }
    	}

    	function computeStyle(node) {
    	  if (node.nodeType !== Node.ELEMENT_NODE) return {};
    	  var DOM_KEY = '__ql-computed-style';
    	  return node[DOM_KEY] || (node[DOM_KEY] = window.getComputedStyle(node));
    	}

    	function deltaEndsWith(delta, text) {
    	  var endText = "";
    	  for (var i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
    	    var op = delta.ops[i];
    	    if (typeof op.insert !== 'string') break;
    	    endText = op.insert + endText;
    	  }
    	  return endText.slice(-1 * text.length) === text;
    	}

    	function isLine(node) {
    	  if (node.childNodes.length === 0) return false; // Exclude embed blocks
    	  var style = computeStyle(node);
    	  return ['block', 'list-item'].indexOf(style.display) > -1;
    	}

    	function traverse(node, elementMatchers, textMatchers) {
    	  // Post-order
    	  if (node.nodeType === node.TEXT_NODE) {
    	    return textMatchers.reduce(function (delta, matcher) {
    	      return matcher(node, delta);
    	    }, new _quillDelta2.default());
    	  } else if (node.nodeType === node.ELEMENT_NODE) {
    	    return [].reduce.call(node.childNodes || [], function (delta, childNode) {
    	      var childrenDelta = traverse(childNode, elementMatchers, textMatchers);
    	      if (childNode.nodeType === node.ELEMENT_NODE) {
    	        childrenDelta = elementMatchers.reduce(function (childrenDelta, matcher) {
    	          return matcher(childNode, childrenDelta);
    	        }, childrenDelta);
    	        childrenDelta = (childNode[DOM_KEY] || []).reduce(function (childrenDelta, matcher) {
    	          return matcher(childNode, childrenDelta);
    	        }, childrenDelta);
    	      }
    	      return delta.concat(childrenDelta);
    	    }, new _quillDelta2.default());
    	  } else {
    	    return new _quillDelta2.default();
    	  }
    	}

    	function matchAlias(format, node, delta) {
    	  return applyFormat(delta, format, true);
    	}

    	function matchAttributor(node, delta) {
    	  var attributes = _parchment2.default.Attributor.Attribute.keys(node);
    	  var classes = _parchment2.default.Attributor.Class.keys(node);
    	  var styles = _parchment2.default.Attributor.Style.keys(node);
    	  var formats = {};
    	  attributes.concat(classes).concat(styles).forEach(function (name) {
    	    var attr = _parchment2.default.query(name, _parchment2.default.Scope.ATTRIBUTE);
    	    if (attr != null) {
    	      formats[attr.attrName] = attr.value(node);
    	      if (formats[attr.attrName]) return;
    	    }
    	    attr = ATTRIBUTE_ATTRIBUTORS[name];
    	    if (attr != null && (attr.attrName === name || attr.keyName === name)) {
    	      formats[attr.attrName] = attr.value(node) || undefined;
    	    }
    	    attr = STYLE_ATTRIBUTORS[name];
    	    if (attr != null && (attr.attrName === name || attr.keyName === name)) {
    	      attr = STYLE_ATTRIBUTORS[name];
    	      formats[attr.attrName] = attr.value(node) || undefined;
    	    }
    	  });
    	  if (Object.keys(formats).length > 0) {
    	    delta = applyFormat(delta, formats);
    	  }
    	  return delta;
    	}

    	function matchBlot(node, delta) {
    	  var match = _parchment2.default.query(node);
    	  if (match == null) return delta;
    	  if (match.prototype instanceof _parchment2.default.Embed) {
    	    var embed = {};
    	    var value = match.value(node);
    	    if (value != null) {
    	      embed[match.blotName] = value;
    	      delta = new _quillDelta2.default().insert(embed, match.formats(node));
    	    }
    	  } else if (typeof match.formats === 'function') {
    	    delta = applyFormat(delta, match.blotName, match.formats(node));
    	  }
    	  return delta;
    	}

    	function matchBreak(node, delta) {
    	  if (!deltaEndsWith(delta, '\n')) {
    	    delta.insert('\n');
    	  }
    	  return delta;
    	}

    	function matchIgnore() {
    	  return new _quillDelta2.default();
    	}

    	function matchIndent(node, delta) {
    	  var match = _parchment2.default.query(node);
    	  if (match == null || match.blotName !== 'list-item' || !deltaEndsWith(delta, '\n')) {
    	    return delta;
    	  }
    	  var indent = -1,
    	      parent = node.parentNode;
    	  while (!parent.classList.contains('ql-clipboard')) {
    	    if ((_parchment2.default.query(parent) || {}).blotName === 'list') {
    	      indent += 1;
    	    }
    	    parent = parent.parentNode;
    	  }
    	  if (indent <= 0) return delta;
    	  return delta.compose(new _quillDelta2.default().retain(delta.length() - 1).retain(1, { indent: indent }));
    	}

    	function matchNewline(node, delta) {
    	  if (!deltaEndsWith(delta, '\n')) {
    	    if (isLine(node) || delta.length() > 0 && node.nextSibling && isLine(node.nextSibling)) {
    	      delta.insert('\n');
    	    }
    	  }
    	  return delta;
    	}

    	function matchSpacing(node, delta) {
    	  if (isLine(node) && node.nextElementSibling != null && !deltaEndsWith(delta, '\n\n')) {
    	    var nodeHeight = node.offsetHeight + parseFloat(computeStyle(node).marginTop) + parseFloat(computeStyle(node).marginBottom);
    	    if (node.nextElementSibling.offsetTop > node.offsetTop + nodeHeight * 1.5) {
    	      delta.insert('\n');
    	    }
    	  }
    	  return delta;
    	}

    	function matchStyles(node, delta) {
    	  var formats = {};
    	  var style = node.style || {};
    	  if (style.fontStyle && computeStyle(node).fontStyle === 'italic') {
    	    formats.italic = true;
    	  }
    	  if (style.fontWeight && (computeStyle(node).fontWeight.startsWith('bold') || parseInt(computeStyle(node).fontWeight) >= 700)) {
    	    formats.bold = true;
    	  }
    	  if (Object.keys(formats).length > 0) {
    	    delta = applyFormat(delta, formats);
    	  }
    	  if (parseFloat(style.textIndent || 0) > 0) {
    	    // Could be 0.5in
    	    delta = new _quillDelta2.default().insert('\t').concat(delta);
    	  }
    	  return delta;
    	}

    	function matchText(node, delta) {
    	  var text = node.data;
    	  // Word represents empty line with <o:p>&nbsp;</o:p>
    	  if (node.parentNode.tagName === 'O:P') {
    	    return delta.insert(text.trim());
    	  }
    	  if (text.trim().length === 0 && node.parentNode.classList.contains('ql-clipboard')) {
    	    return delta;
    	  }
    	  if (!computeStyle(node.parentNode).whiteSpace.startsWith('pre')) {
    	    // eslint-disable-next-line func-style
    	    var replacer = function replacer(collapse, match) {
    	      match = match.replace(/[^\u00a0]/g, ''); // \u00a0 is nbsp;
    	      return match.length < 1 && collapse ? ' ' : match;
    	    };
    	    text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
    	    text = text.replace(/\s\s+/g, replacer.bind(replacer, true)); // collapse whitespace
    	    if (node.previousSibling == null && isLine(node.parentNode) || node.previousSibling != null && isLine(node.previousSibling)) {
    	      text = text.replace(/^\s+/, replacer.bind(replacer, false));
    	    }
    	    if (node.nextSibling == null && isLine(node.parentNode) || node.nextSibling != null && isLine(node.nextSibling)) {
    	      text = text.replace(/\s+$/, replacer.bind(replacer, false));
    	    }
    	  }
    	  return delta.insert(text);
    	}

    	exports.default = Clipboard;
    	exports.matchAttributor = matchAttributor;
    	exports.matchBlot = matchBlot;
    	exports.matchNewline = matchNewline;
    	exports.matchSpacing = matchSpacing;
    	exports.matchText = matchText;

    	/***/ }),
    	/* 56 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Bold = function (_Inline) {
    	  _inherits(Bold, _Inline);

    	  function Bold() {
    	    _classCallCheck(this, Bold);

    	    return _possibleConstructorReturn(this, (Bold.__proto__ || Object.getPrototypeOf(Bold)).apply(this, arguments));
    	  }

    	  _createClass(Bold, [{
    	    key: 'optimize',
    	    value: function optimize(context) {
    	      _get(Bold.prototype.__proto__ || Object.getPrototypeOf(Bold.prototype), 'optimize', this).call(this, context);
    	      if (this.domNode.tagName !== this.statics.tagName[0]) {
    	        this.replaceWith(this.statics.blotName);
    	      }
    	    }
    	  }], [{
    	    key: 'create',
    	    value: function create() {
    	      return _get(Bold.__proto__ || Object.getPrototypeOf(Bold), 'create', this).call(this);
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats() {
    	      return true;
    	    }
    	  }]);

    	  return Bold;
    	}(_inline2.default);

    	Bold.blotName = 'bold';
    	Bold.tagName = ['STRONG', 'B'];

    	exports.default = Bold;

    	/***/ }),
    	/* 57 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.addControls = exports.default = undefined;

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _quillDelta = __webpack_require__(2);

    	var _quillDelta2 = _interopRequireDefault(_quillDelta);

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _logger = __webpack_require__(10);

    	var _logger2 = _interopRequireDefault(_logger);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var debug = (0, _logger2.default)('quill:toolbar');

    	var Toolbar = function (_Module) {
    	  _inherits(Toolbar, _Module);

    	  function Toolbar(quill, options) {
    	    _classCallCheck(this, Toolbar);

    	    var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, quill, options));

    	    if (Array.isArray(_this.options.container)) {
    	      var container = document.createElement('div');
    	      addControls(container, _this.options.container);
    	      quill.container.parentNode.insertBefore(container, quill.container);
    	      _this.container = container;
    	    } else if (typeof _this.options.container === 'string') {
    	      _this.container = document.querySelector(_this.options.container);
    	    } else {
    	      _this.container = _this.options.container;
    	    }
    	    if (!(_this.container instanceof HTMLElement)) {
    	      var _ret;

    	      return _ret = debug.error('Container required for toolbar', _this.options), _possibleConstructorReturn(_this, _ret);
    	    }
    	    _this.container.classList.add('ql-toolbar');
    	    _this.controls = [];
    	    _this.handlers = {};
    	    Object.keys(_this.options.handlers).forEach(function (format) {
    	      _this.addHandler(format, _this.options.handlers[format]);
    	    });
    	    [].forEach.call(_this.container.querySelectorAll('button, select'), function (input) {
    	      _this.attach(input);
    	    });
    	    _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (type, range) {
    	      if (type === _quill2.default.events.SELECTION_CHANGE) {
    	        _this.update(range);
    	      }
    	    });
    	    _this.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
    	      var _this$quill$selection = _this.quill.selection.getRange(),
    	          _this$quill$selection2 = _slicedToArray(_this$quill$selection, 1),
    	          range = _this$quill$selection2[0]; // quill.getSelection triggers update


    	      _this.update(range);
    	    });
    	    return _this;
    	  }

    	  _createClass(Toolbar, [{
    	    key: 'addHandler',
    	    value: function addHandler(format, handler) {
    	      this.handlers[format] = handler;
    	    }
    	  }, {
    	    key: 'attach',
    	    value: function attach(input) {
    	      var _this2 = this;

    	      var format = [].find.call(input.classList, function (className) {
    	        return className.indexOf('ql-') === 0;
    	      });
    	      if (!format) return;
    	      format = format.slice('ql-'.length);
    	      if (input.tagName === 'BUTTON') {
    	        input.setAttribute('type', 'button');
    	      }
    	      if (this.handlers[format] == null) {
    	        if (this.quill.scroll.whitelist != null && this.quill.scroll.whitelist[format] == null) {
    	          debug.warn('ignoring attaching to disabled format', format, input);
    	          return;
    	        }
    	        if (_parchment2.default.query(format) == null) {
    	          debug.warn('ignoring attaching to nonexistent format', format, input);
    	          return;
    	        }
    	      }
    	      var eventName = input.tagName === 'SELECT' ? 'change' : 'click';
    	      input.addEventListener(eventName, function (e) {
    	        var value = void 0;
    	        if (input.tagName === 'SELECT') {
    	          if (input.selectedIndex < 0) return;
    	          var selected = input.options[input.selectedIndex];
    	          if (selected.hasAttribute('selected')) {
    	            value = false;
    	          } else {
    	            value = selected.value || false;
    	          }
    	        } else {
    	          if (input.classList.contains('ql-active')) {
    	            value = false;
    	          } else {
    	            value = input.value || !input.hasAttribute('value');
    	          }
    	          e.preventDefault();
    	        }
    	        _this2.quill.focus();

    	        var _quill$selection$getR = _this2.quill.selection.getRange(),
    	            _quill$selection$getR2 = _slicedToArray(_quill$selection$getR, 1),
    	            range = _quill$selection$getR2[0];

    	        if (_this2.handlers[format] != null) {
    	          _this2.handlers[format].call(_this2, value);
    	        } else if (_parchment2.default.query(format).prototype instanceof _parchment2.default.Embed) {
    	          value = prompt('Enter ' + format);
    	          if (!value) return;
    	          _this2.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert(_defineProperty({}, format, value)), _quill2.default.sources.USER);
    	        } else {
    	          _this2.quill.format(format, value, _quill2.default.sources.USER);
    	        }
    	        _this2.update(range);
    	      });
    	      // TODO use weakmap
    	      this.controls.push([format, input]);
    	    }
    	  }, {
    	    key: 'update',
    	    value: function update(range) {
    	      var formats = range == null ? {} : this.quill.getFormat(range);
    	      this.controls.forEach(function (pair) {
    	        var _pair = _slicedToArray(pair, 2),
    	            format = _pair[0],
    	            input = _pair[1];

    	        if (input.tagName === 'SELECT') {
    	          var option = void 0;
    	          if (range == null) {
    	            option = null;
    	          } else if (formats[format] == null) {
    	            option = input.querySelector('option[selected]');
    	          } else if (!Array.isArray(formats[format])) {
    	            var value = formats[format];
    	            if (typeof value === 'string') {
    	              value = value.replace(/\"/g, '\\"');
    	            }
    	            option = input.querySelector('option[value="' + value + '"]');
    	          }
    	          if (option == null) {
    	            input.value = ''; // TODO make configurable?
    	            input.selectedIndex = -1;
    	          } else {
    	            option.selected = true;
    	          }
    	        } else {
    	          if (range == null) {
    	            input.classList.remove('ql-active');
    	          } else if (input.hasAttribute('value')) {
    	            // both being null should match (default values)
    	            // '1' should match with 1 (headers)
    	            var isActive = formats[format] === input.getAttribute('value') || formats[format] != null && formats[format].toString() === input.getAttribute('value') || formats[format] == null && !input.getAttribute('value');
    	            input.classList.toggle('ql-active', isActive);
    	          } else {
    	            input.classList.toggle('ql-active', formats[format] != null);
    	          }
    	        }
    	      });
    	    }
    	  }]);

    	  return Toolbar;
    	}(_module2.default);

    	Toolbar.DEFAULTS = {};

    	function addButton(container, format, value) {
    	  var input = document.createElement('button');
    	  input.setAttribute('type', 'button');
    	  input.classList.add('ql-' + format);
    	  if (value != null) {
    	    input.value = value;
    	  }
    	  container.appendChild(input);
    	}

    	function addControls(container, groups) {
    	  if (!Array.isArray(groups[0])) {
    	    groups = [groups];
    	  }
    	  groups.forEach(function (controls) {
    	    var group = document.createElement('span');
    	    group.classList.add('ql-formats');
    	    controls.forEach(function (control) {
    	      if (typeof control === 'string') {
    	        addButton(group, control);
    	      } else {
    	        var format = Object.keys(control)[0];
    	        var value = control[format];
    	        if (Array.isArray(value)) {
    	          addSelect(group, format, value);
    	        } else {
    	          addButton(group, format, value);
    	        }
    	      }
    	    });
    	    container.appendChild(group);
    	  });
    	}

    	function addSelect(container, format, values) {
    	  var input = document.createElement('select');
    	  input.classList.add('ql-' + format);
    	  values.forEach(function (value) {
    	    var option = document.createElement('option');
    	    if (value !== false) {
    	      option.setAttribute('value', value);
    	    } else {
    	      option.setAttribute('selected', 'selected');
    	    }
    	    input.appendChild(option);
    	  });
    	  container.appendChild(input);
    	}

    	Toolbar.DEFAULTS = {
    	  container: null,
    	  handlers: {
    	    clean: function clean() {
    	      var _this3 = this;

    	      var range = this.quill.getSelection();
    	      if (range == null) return;
    	      if (range.length == 0) {
    	        var formats = this.quill.getFormat();
    	        Object.keys(formats).forEach(function (name) {
    	          // Clean functionality in existing apps only clean inline formats
    	          if (_parchment2.default.query(name, _parchment2.default.Scope.INLINE) != null) {
    	            _this3.quill.format(name, false);
    	          }
    	        });
    	      } else {
    	        this.quill.removeFormat(range, _quill2.default.sources.USER);
    	      }
    	    },
    	    direction: function direction(value) {
    	      var align = this.quill.getFormat()['align'];
    	      if (value === 'rtl' && align == null) {
    	        this.quill.format('align', 'right', _quill2.default.sources.USER);
    	      } else if (!value && align === 'right') {
    	        this.quill.format('align', false, _quill2.default.sources.USER);
    	      }
    	      this.quill.format('direction', value, _quill2.default.sources.USER);
    	    },
    	    indent: function indent(value) {
    	      var range = this.quill.getSelection();
    	      var formats = this.quill.getFormat(range);
    	      var indent = parseInt(formats.indent || 0);
    	      if (value === '+1' || value === '-1') {
    	        var modifier = value === '+1' ? 1 : -1;
    	        if (formats.direction === 'rtl') modifier *= -1;
    	        this.quill.format('indent', indent + modifier, _quill2.default.sources.USER);
    	      }
    	    },
    	    link: function link(value) {
    	      if (value === true) {
    	        value = prompt('Enter link URL:');
    	      }
    	      this.quill.format('link', value, _quill2.default.sources.USER);
    	    },
    	    list: function list(value) {
    	      var range = this.quill.getSelection();
    	      var formats = this.quill.getFormat(range);
    	      if (value === 'check') {
    	        if (formats['list'] === 'checked' || formats['list'] === 'unchecked') {
    	          this.quill.format('list', false, _quill2.default.sources.USER);
    	        } else {
    	          this.quill.format('list', 'unchecked', _quill2.default.sources.USER);
    	        }
    	      } else {
    	        this.quill.format('list', value, _quill2.default.sources.USER);
    	      }
    	    }
    	  }
    	};

    	exports.default = Toolbar;
    	exports.addControls = addControls;

    	/***/ }),
    	/* 58 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <polyline class=\"ql-even ql-stroke\" points=\"5 7 3 9 5 11\"></polyline> <polyline class=\"ql-even ql-stroke\" points=\"13 7 15 9 13 11\"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>";

    	/***/ }),
    	/* 59 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _picker = __webpack_require__(28);

    	var _picker2 = _interopRequireDefault(_picker);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var ColorPicker = function (_Picker) {
    	  _inherits(ColorPicker, _Picker);

    	  function ColorPicker(select, label) {
    	    _classCallCheck(this, ColorPicker);

    	    var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, select));

    	    _this.label.innerHTML = label;
    	    _this.container.classList.add('ql-color-picker');
    	    [].slice.call(_this.container.querySelectorAll('.ql-picker-item'), 0, 7).forEach(function (item) {
    	      item.classList.add('ql-primary');
    	    });
    	    return _this;
    	  }

    	  _createClass(ColorPicker, [{
    	    key: 'buildItem',
    	    value: function buildItem(option) {
    	      var item = _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'buildItem', this).call(this, option);
    	      item.style.backgroundColor = option.getAttribute('value') || '';
    	      return item;
    	    }
    	  }, {
    	    key: 'selectItem',
    	    value: function selectItem(item, trigger) {
    	      _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'selectItem', this).call(this, item, trigger);
    	      var colorLabel = this.label.querySelector('.ql-color-label');
    	      var value = item ? item.getAttribute('data-value') || '' : '';
    	      if (colorLabel) {
    	        if (colorLabel.tagName === 'line') {
    	          colorLabel.style.stroke = value;
    	        } else {
    	          colorLabel.style.fill = value;
    	        }
    	      }
    	    }
    	  }]);

    	  return ColorPicker;
    	}(_picker2.default);

    	exports.default = ColorPicker;

    	/***/ }),
    	/* 60 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _picker = __webpack_require__(28);

    	var _picker2 = _interopRequireDefault(_picker);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var IconPicker = function (_Picker) {
    	  _inherits(IconPicker, _Picker);

    	  function IconPicker(select, icons) {
    	    _classCallCheck(this, IconPicker);

    	    var _this = _possibleConstructorReturn(this, (IconPicker.__proto__ || Object.getPrototypeOf(IconPicker)).call(this, select));

    	    _this.container.classList.add('ql-icon-picker');
    	    [].forEach.call(_this.container.querySelectorAll('.ql-picker-item'), function (item) {
    	      item.innerHTML = icons[item.getAttribute('data-value') || ''];
    	    });
    	    _this.defaultItem = _this.container.querySelector('.ql-selected');
    	    _this.selectItem(_this.defaultItem);
    	    return _this;
    	  }

    	  _createClass(IconPicker, [{
    	    key: 'selectItem',
    	    value: function selectItem(item, trigger) {
    	      _get(IconPicker.prototype.__proto__ || Object.getPrototypeOf(IconPicker.prototype), 'selectItem', this).call(this, item, trigger);
    	      item = item || this.defaultItem;
    	      this.label.innerHTML = item.innerHTML;
    	    }
    	  }]);

    	  return IconPicker;
    	}(_picker2.default);

    	exports.default = IconPicker;

    	/***/ }),
    	/* 61 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var Tooltip = function () {
    	  function Tooltip(quill, boundsContainer) {
    	    var _this = this;

    	    _classCallCheck(this, Tooltip);

    	    this.quill = quill;
    	    this.boundsContainer = boundsContainer || document.body;
    	    this.root = quill.addContainer('ql-tooltip');
    	    this.root.innerHTML = this.constructor.TEMPLATE;
    	    if (this.quill.root === this.quill.scrollingContainer) {
    	      this.quill.root.addEventListener('scroll', function () {
    	        _this.root.style.marginTop = -1 * _this.quill.root.scrollTop + 'px';
    	      });
    	    }
    	    this.hide();
    	  }

    	  _createClass(Tooltip, [{
    	    key: 'hide',
    	    value: function hide() {
    	      this.root.classList.add('ql-hidden');
    	    }
    	  }, {
    	    key: 'position',
    	    value: function position(reference) {
    	      var left = reference.left + reference.width / 2 - this.root.offsetWidth / 2;
    	      // root.scrollTop should be 0 if scrollContainer !== root
    	      var top = reference.bottom + this.quill.root.scrollTop;
    	      this.root.style.left = left + 'px';
    	      this.root.style.top = top + 'px';
    	      this.root.classList.remove('ql-flip');
    	      var containerBounds = this.boundsContainer.getBoundingClientRect();
    	      var rootBounds = this.root.getBoundingClientRect();
    	      var shift = 0;
    	      if (rootBounds.right > containerBounds.right) {
    	        shift = containerBounds.right - rootBounds.right;
    	        this.root.style.left = left + shift + 'px';
    	      }
    	      if (rootBounds.left < containerBounds.left) {
    	        shift = containerBounds.left - rootBounds.left;
    	        this.root.style.left = left + shift + 'px';
    	      }
    	      if (rootBounds.bottom > containerBounds.bottom) {
    	        var height = rootBounds.bottom - rootBounds.top;
    	        var verticalShift = reference.bottom - reference.top + height;
    	        this.root.style.top = top - verticalShift + 'px';
    	        this.root.classList.add('ql-flip');
    	      }
    	      return shift;
    	    }
    	  }, {
    	    key: 'show',
    	    value: function show() {
    	      this.root.classList.remove('ql-editing');
    	      this.root.classList.remove('ql-hidden');
    	    }
    	  }]);

    	  return Tooltip;
    	}();

    	exports.default = Tooltip;

    	/***/ }),
    	/* 62 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	var _emitter = __webpack_require__(8);

    	var _emitter2 = _interopRequireDefault(_emitter);

    	var _base = __webpack_require__(43);

    	var _base2 = _interopRequireDefault(_base);

    	var _link = __webpack_require__(27);

    	var _link2 = _interopRequireDefault(_link);

    	var _selection = __webpack_require__(15);

    	var _icons = __webpack_require__(41);

    	var _icons2 = _interopRequireDefault(_icons);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var TOOLBAR_CONFIG = [[{ header: ['1', '2', '3', false] }], ['bold', 'italic', 'underline', 'link'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']];

    	var SnowTheme = function (_BaseTheme) {
    	  _inherits(SnowTheme, _BaseTheme);

    	  function SnowTheme(quill, options) {
    	    _classCallCheck(this, SnowTheme);

    	    if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
    	      options.modules.toolbar.container = TOOLBAR_CONFIG;
    	    }

    	    var _this = _possibleConstructorReturn(this, (SnowTheme.__proto__ || Object.getPrototypeOf(SnowTheme)).call(this, quill, options));

    	    _this.quill.container.classList.add('ql-snow');
    	    return _this;
    	  }

    	  _createClass(SnowTheme, [{
    	    key: 'extendToolbar',
    	    value: function extendToolbar(toolbar) {
    	      toolbar.container.classList.add('ql-snow');
    	      this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
    	      this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
    	      this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
    	      if (toolbar.container.querySelector('.ql-link')) {
    	        this.quill.keyboard.addBinding({ key: 'K', shortKey: true }, function (range, context) {
    	          toolbar.handlers['link'].call(toolbar, !context.format.link);
    	        });
    	      }
    	    }
    	  }]);

    	  return SnowTheme;
    	}(_base2.default);

    	SnowTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
    	  modules: {
    	    toolbar: {
    	      handlers: {
    	        link: function link(value) {
    	          if (value) {
    	            var range = this.quill.getSelection();
    	            if (range == null || range.length == 0) return;
    	            var preview = this.quill.getText(range);
    	            if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
    	              preview = 'mailto:' + preview;
    	            }
    	            var tooltip = this.quill.theme.tooltip;
    	            tooltip.edit('link', preview);
    	          } else {
    	            this.quill.format('link', false);
    	          }
    	        }
    	      }
    	    }
    	  }
    	});

    	var SnowTooltip = function (_BaseTooltip) {
    	  _inherits(SnowTooltip, _BaseTooltip);

    	  function SnowTooltip(quill, bounds) {
    	    _classCallCheck(this, SnowTooltip);

    	    var _this2 = _possibleConstructorReturn(this, (SnowTooltip.__proto__ || Object.getPrototypeOf(SnowTooltip)).call(this, quill, bounds));

    	    _this2.preview = _this2.root.querySelector('a.ql-preview');
    	    return _this2;
    	  }

    	  _createClass(SnowTooltip, [{
    	    key: 'listen',
    	    value: function listen() {
    	      var _this3 = this;

    	      _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'listen', this).call(this);
    	      this.root.querySelector('a.ql-action').addEventListener('click', function (event) {
    	        if (_this3.root.classList.contains('ql-editing')) {
    	          _this3.save();
    	        } else {
    	          _this3.edit('link', _this3.preview.textContent);
    	        }
    	        event.preventDefault();
    	      });
    	      this.root.querySelector('a.ql-remove').addEventListener('click', function (event) {
    	        if (_this3.linkRange != null) {
    	          var range = _this3.linkRange;
    	          _this3.restoreFocus();
    	          _this3.quill.formatText(range, 'link', false, _emitter2.default.sources.USER);
    	          delete _this3.linkRange;
    	        }
    	        event.preventDefault();
    	        _this3.hide();
    	      });
    	      this.quill.on(_emitter2.default.events.SELECTION_CHANGE, function (range, oldRange, source) {
    	        if (range == null) return;
    	        if (range.length === 0 && source === _emitter2.default.sources.USER) {
    	          var _quill$scroll$descend = _this3.quill.scroll.descendant(_link2.default, range.index),
    	              _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
    	              link = _quill$scroll$descend2[0],
    	              offset = _quill$scroll$descend2[1];

    	          if (link != null) {
    	            _this3.linkRange = new _selection.Range(range.index - offset, link.length());
    	            var preview = _link2.default.formats(link.domNode);
    	            _this3.preview.textContent = preview;
    	            _this3.preview.setAttribute('href', preview);
    	            _this3.show();
    	            _this3.position(_this3.quill.getBounds(_this3.linkRange));
    	            return;
    	          }
    	        } else {
    	          delete _this3.linkRange;
    	        }
    	        _this3.hide();
    	      });
    	    }
    	  }, {
    	    key: 'show',
    	    value: function show() {
    	      _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'show', this).call(this);
    	      this.root.removeAttribute('data-mode');
    	    }
    	  }]);

    	  return SnowTooltip;
    	}(_base.BaseTooltip);

    	SnowTooltip.TEMPLATE = ['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-action"></a>', '<a class="ql-remove"></a>'].join('');

    	exports.default = SnowTheme;

    	/***/ }),
    	/* 63 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _core = __webpack_require__(29);

    	var _core2 = _interopRequireDefault(_core);

    	var _align = __webpack_require__(36);

    	var _direction = __webpack_require__(38);

    	var _indent = __webpack_require__(64);

    	var _blockquote = __webpack_require__(65);

    	var _blockquote2 = _interopRequireDefault(_blockquote);

    	var _header = __webpack_require__(66);

    	var _header2 = _interopRequireDefault(_header);

    	var _list = __webpack_require__(67);

    	var _list2 = _interopRequireDefault(_list);

    	var _background = __webpack_require__(37);

    	var _color = __webpack_require__(26);

    	var _font = __webpack_require__(39);

    	var _size = __webpack_require__(40);

    	var _bold = __webpack_require__(56);

    	var _bold2 = _interopRequireDefault(_bold);

    	var _italic = __webpack_require__(68);

    	var _italic2 = _interopRequireDefault(_italic);

    	var _link = __webpack_require__(27);

    	var _link2 = _interopRequireDefault(_link);

    	var _script = __webpack_require__(69);

    	var _script2 = _interopRequireDefault(_script);

    	var _strike = __webpack_require__(70);

    	var _strike2 = _interopRequireDefault(_strike);

    	var _underline = __webpack_require__(71);

    	var _underline2 = _interopRequireDefault(_underline);

    	var _image = __webpack_require__(72);

    	var _image2 = _interopRequireDefault(_image);

    	var _video = __webpack_require__(73);

    	var _video2 = _interopRequireDefault(_video);

    	var _code = __webpack_require__(13);

    	var _code2 = _interopRequireDefault(_code);

    	var _formula = __webpack_require__(74);

    	var _formula2 = _interopRequireDefault(_formula);

    	var _syntax = __webpack_require__(75);

    	var _syntax2 = _interopRequireDefault(_syntax);

    	var _toolbar = __webpack_require__(57);

    	var _toolbar2 = _interopRequireDefault(_toolbar);

    	var _icons = __webpack_require__(41);

    	var _icons2 = _interopRequireDefault(_icons);

    	var _picker = __webpack_require__(28);

    	var _picker2 = _interopRequireDefault(_picker);

    	var _colorPicker = __webpack_require__(59);

    	var _colorPicker2 = _interopRequireDefault(_colorPicker);

    	var _iconPicker = __webpack_require__(60);

    	var _iconPicker2 = _interopRequireDefault(_iconPicker);

    	var _tooltip = __webpack_require__(61);

    	var _tooltip2 = _interopRequireDefault(_tooltip);

    	var _bubble = __webpack_require__(108);

    	var _bubble2 = _interopRequireDefault(_bubble);

    	var _snow = __webpack_require__(62);

    	var _snow2 = _interopRequireDefault(_snow);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	_core2.default.register({
    	  'attributors/attribute/direction': _direction.DirectionAttribute,

    	  'attributors/class/align': _align.AlignClass,
    	  'attributors/class/background': _background.BackgroundClass,
    	  'attributors/class/color': _color.ColorClass,
    	  'attributors/class/direction': _direction.DirectionClass,
    	  'attributors/class/font': _font.FontClass,
    	  'attributors/class/size': _size.SizeClass,

    	  'attributors/style/align': _align.AlignStyle,
    	  'attributors/style/background': _background.BackgroundStyle,
    	  'attributors/style/color': _color.ColorStyle,
    	  'attributors/style/direction': _direction.DirectionStyle,
    	  'attributors/style/font': _font.FontStyle,
    	  'attributors/style/size': _size.SizeStyle
    	}, true);

    	_core2.default.register({
    	  'formats/align': _align.AlignClass,
    	  'formats/direction': _direction.DirectionClass,
    	  'formats/indent': _indent.IndentClass,

    	  'formats/background': _background.BackgroundStyle,
    	  'formats/color': _color.ColorStyle,
    	  'formats/font': _font.FontClass,
    	  'formats/size': _size.SizeClass,

    	  'formats/blockquote': _blockquote2.default,
    	  'formats/code-block': _code2.default,
    	  'formats/header': _header2.default,
    	  'formats/list': _list2.default,

    	  'formats/bold': _bold2.default,
    	  'formats/code': _code.Code,
    	  'formats/italic': _italic2.default,
    	  'formats/link': _link2.default,
    	  'formats/script': _script2.default,
    	  'formats/strike': _strike2.default,
    	  'formats/underline': _underline2.default,

    	  'formats/image': _image2.default,
    	  'formats/video': _video2.default,

    	  'formats/list/item': _list.ListItem,

    	  'modules/formula': _formula2.default,
    	  'modules/syntax': _syntax2.default,
    	  'modules/toolbar': _toolbar2.default,

    	  'themes/bubble': _bubble2.default,
    	  'themes/snow': _snow2.default,

    	  'ui/icons': _icons2.default,
    	  'ui/picker': _picker2.default,
    	  'ui/icon-picker': _iconPicker2.default,
    	  'ui/color-picker': _colorPicker2.default,
    	  'ui/tooltip': _tooltip2.default
    	}, true);

    	exports.default = _core2.default;

    	/***/ }),
    	/* 64 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.IndentClass = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var IdentAttributor = function (_Parchment$Attributor) {
    	  _inherits(IdentAttributor, _Parchment$Attributor);

    	  function IdentAttributor() {
    	    _classCallCheck(this, IdentAttributor);

    	    return _possibleConstructorReturn(this, (IdentAttributor.__proto__ || Object.getPrototypeOf(IdentAttributor)).apply(this, arguments));
    	  }

    	  _createClass(IdentAttributor, [{
    	    key: 'add',
    	    value: function add(node, value) {
    	      if (value === '+1' || value === '-1') {
    	        var indent = this.value(node) || 0;
    	        value = value === '+1' ? indent + 1 : indent - 1;
    	      }
    	      if (value === 0) {
    	        this.remove(node);
    	        return true;
    	      } else {
    	        return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'add', this).call(this, node, value);
    	      }
    	    }
    	  }, {
    	    key: 'canAdd',
    	    value: function canAdd(node, value) {
    	      return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, value) || _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, parseInt(value));
    	    }
    	  }, {
    	    key: 'value',
    	    value: function value(node) {
    	      return parseInt(_get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'value', this).call(this, node)) || undefined; // Don't return NaN
    	    }
    	  }]);

    	  return IdentAttributor;
    	}(_parchment2.default.Attributor.Class);

    	var IndentClass = new IdentAttributor('indent', 'ql-indent', {
    	  scope: _parchment2.default.Scope.BLOCK,
    	  whitelist: [1, 2, 3, 4, 5, 6, 7, 8]
    	});

    	exports.IndentClass = IndentClass;

    	/***/ }),
    	/* 65 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Blockquote = function (_Block) {
    	  _inherits(Blockquote, _Block);

    	  function Blockquote() {
    	    _classCallCheck(this, Blockquote);

    	    return _possibleConstructorReturn(this, (Blockquote.__proto__ || Object.getPrototypeOf(Blockquote)).apply(this, arguments));
    	  }

    	  return Blockquote;
    	}(_block2.default);

    	Blockquote.blotName = 'blockquote';
    	Blockquote.tagName = 'blockquote';

    	exports.default = Blockquote;

    	/***/ }),
    	/* 66 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Header = function (_Block) {
    	  _inherits(Header, _Block);

    	  function Header() {
    	    _classCallCheck(this, Header);

    	    return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
    	  }

    	  _createClass(Header, null, [{
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      return this.tagName.indexOf(domNode.tagName) + 1;
    	    }
    	  }]);

    	  return Header;
    	}(_block2.default);

    	Header.blotName = 'header';
    	Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    	exports.default = Header;

    	/***/ }),
    	/* 67 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.ListItem = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _block = __webpack_require__(4);

    	var _block2 = _interopRequireDefault(_block);

    	var _container = __webpack_require__(25);

    	var _container2 = _interopRequireDefault(_container);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var ListItem = function (_Block) {
    	  _inherits(ListItem, _Block);

    	  function ListItem() {
    	    _classCallCheck(this, ListItem);

    	    return _possibleConstructorReturn(this, (ListItem.__proto__ || Object.getPrototypeOf(ListItem)).apply(this, arguments));
    	  }

    	  _createClass(ListItem, [{
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (name === List.blotName && !value) {
    	        this.replaceWith(_parchment2.default.create(this.statics.scope));
    	      } else {
    	        _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'format', this).call(this, name, value);
    	      }
    	    }
    	  }, {
    	    key: 'remove',
    	    value: function remove() {
    	      if (this.prev == null && this.next == null) {
    	        this.parent.remove();
    	      } else {
    	        _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'remove', this).call(this);
    	      }
    	    }
    	  }, {
    	    key: 'replaceWith',
    	    value: function replaceWith(name, value) {
    	      this.parent.isolate(this.offset(this.parent), this.length());
    	      if (name === this.parent.statics.blotName) {
    	        this.parent.replaceWith(name, value);
    	        return this;
    	      } else {
    	        this.parent.unwrap();
    	        return _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'replaceWith', this).call(this, name, value);
    	      }
    	    }
    	  }], [{
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      return domNode.tagName === this.tagName ? undefined : _get(ListItem.__proto__ || Object.getPrototypeOf(ListItem), 'formats', this).call(this, domNode);
    	    }
    	  }]);

    	  return ListItem;
    	}(_block2.default);

    	ListItem.blotName = 'list-item';
    	ListItem.tagName = 'LI';

    	var List = function (_Container) {
    	  _inherits(List, _Container);

    	  _createClass(List, null, [{
    	    key: 'create',
    	    value: function create(value) {
    	      var tagName = value === 'ordered' ? 'OL' : 'UL';
    	      var node = _get(List.__proto__ || Object.getPrototypeOf(List), 'create', this).call(this, tagName);
    	      if (value === 'checked' || value === 'unchecked') {
    	        node.setAttribute('data-checked', value === 'checked');
    	      }
    	      return node;
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      if (domNode.tagName === 'OL') return 'ordered';
    	      if (domNode.tagName === 'UL') {
    	        if (domNode.hasAttribute('data-checked')) {
    	          return domNode.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked';
    	        } else {
    	          return 'bullet';
    	        }
    	      }
    	      return undefined;
    	    }
    	  }]);

    	  function List(domNode) {
    	    _classCallCheck(this, List);

    	    var _this2 = _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, domNode));

    	    var listEventHandler = function listEventHandler(e) {
    	      if (e.target.parentNode !== domNode) return;
    	      var format = _this2.statics.formats(domNode);
    	      var blot = _parchment2.default.find(e.target);
    	      if (format === 'checked') {
    	        blot.format('list', 'unchecked');
    	      } else if (format === 'unchecked') {
    	        blot.format('list', 'checked');
    	      }
    	    };

    	    domNode.addEventListener('touchstart', listEventHandler);
    	    domNode.addEventListener('mousedown', listEventHandler);
    	    return _this2;
    	  }

    	  _createClass(List, [{
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (this.children.length > 0) {
    	        this.children.tail.format(name, value);
    	      }
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats() {
    	      // We don't inherit from FormatBlot
    	      return _defineProperty({}, this.statics.blotName, this.statics.formats(this.domNode));
    	    }
    	  }, {
    	    key: 'insertBefore',
    	    value: function insertBefore(blot, ref) {
    	      if (blot instanceof ListItem) {
    	        _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'insertBefore', this).call(this, blot, ref);
    	      } else {
    	        var index = ref == null ? this.length() : ref.offset(this);
    	        var after = this.split(index);
    	        after.parent.insertBefore(blot, after);
    	      }
    	    }
    	  }, {
    	    key: 'optimize',
    	    value: function optimize(context) {
    	      _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'optimize', this).call(this, context);
    	      var next = this.next;
    	      if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName && next.domNode.getAttribute('data-checked') === this.domNode.getAttribute('data-checked')) {
    	        next.moveChildren(this);
    	        next.remove();
    	      }
    	    }
    	  }, {
    	    key: 'replace',
    	    value: function replace(target) {
    	      if (target.statics.blotName !== this.statics.blotName) {
    	        var item = _parchment2.default.create(this.statics.defaultChild);
    	        target.moveChildren(item);
    	        this.appendChild(item);
    	      }
    	      _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'replace', this).call(this, target);
    	    }
    	  }]);

    	  return List;
    	}(_container2.default);

    	List.blotName = 'list';
    	List.scope = _parchment2.default.Scope.BLOCK_BLOT;
    	List.tagName = ['OL', 'UL'];
    	List.defaultChild = 'list-item';
    	List.allowedChildren = [ListItem];

    	exports.ListItem = ListItem;
    	exports.default = List;

    	/***/ }),
    	/* 68 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _bold = __webpack_require__(56);

    	var _bold2 = _interopRequireDefault(_bold);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Italic = function (_Bold) {
    	  _inherits(Italic, _Bold);

    	  function Italic() {
    	    _classCallCheck(this, Italic);

    	    return _possibleConstructorReturn(this, (Italic.__proto__ || Object.getPrototypeOf(Italic)).apply(this, arguments));
    	  }

    	  return Italic;
    	}(_bold2.default);

    	Italic.blotName = 'italic';
    	Italic.tagName = ['EM', 'I'];

    	exports.default = Italic;

    	/***/ }),
    	/* 69 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Script = function (_Inline) {
    	  _inherits(Script, _Inline);

    	  function Script() {
    	    _classCallCheck(this, Script);

    	    return _possibleConstructorReturn(this, (Script.__proto__ || Object.getPrototypeOf(Script)).apply(this, arguments));
    	  }

    	  _createClass(Script, null, [{
    	    key: 'create',
    	    value: function create(value) {
    	      if (value === 'super') {
    	        return document.createElement('sup');
    	      } else if (value === 'sub') {
    	        return document.createElement('sub');
    	      } else {
    	        return _get(Script.__proto__ || Object.getPrototypeOf(Script), 'create', this).call(this, value);
    	      }
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      if (domNode.tagName === 'SUB') return 'sub';
    	      if (domNode.tagName === 'SUP') return 'super';
    	      return undefined;
    	    }
    	  }]);

    	  return Script;
    	}(_inline2.default);

    	Script.blotName = 'script';
    	Script.tagName = ['SUB', 'SUP'];

    	exports.default = Script;

    	/***/ }),
    	/* 70 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Strike = function (_Inline) {
    	  _inherits(Strike, _Inline);

    	  function Strike() {
    	    _classCallCheck(this, Strike);

    	    return _possibleConstructorReturn(this, (Strike.__proto__ || Object.getPrototypeOf(Strike)).apply(this, arguments));
    	  }

    	  return Strike;
    	}(_inline2.default);

    	Strike.blotName = 'strike';
    	Strike.tagName = 'S';

    	exports.default = Strike;

    	/***/ }),
    	/* 71 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _inline = __webpack_require__(6);

    	var _inline2 = _interopRequireDefault(_inline);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var Underline = function (_Inline) {
    	  _inherits(Underline, _Inline);

    	  function Underline() {
    	    _classCallCheck(this, Underline);

    	    return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).apply(this, arguments));
    	  }

    	  return Underline;
    	}(_inline2.default);

    	Underline.blotName = 'underline';
    	Underline.tagName = 'U';

    	exports.default = Underline;

    	/***/ }),
    	/* 72 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _link = __webpack_require__(27);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var ATTRIBUTES = ['alt', 'height', 'width'];

    	var Image = function (_Parchment$Embed) {
    	  _inherits(Image, _Parchment$Embed);

    	  function Image() {
    	    _classCallCheck(this, Image);

    	    return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
    	  }

    	  _createClass(Image, [{
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (ATTRIBUTES.indexOf(name) > -1) {
    	        if (value) {
    	          this.domNode.setAttribute(name, value);
    	        } else {
    	          this.domNode.removeAttribute(name);
    	        }
    	      } else {
    	        _get(Image.prototype.__proto__ || Object.getPrototypeOf(Image.prototype), 'format', this).call(this, name, value);
    	      }
    	    }
    	  }], [{
    	    key: 'create',
    	    value: function create(value) {
    	      var node = _get(Image.__proto__ || Object.getPrototypeOf(Image), 'create', this).call(this, value);
    	      if (typeof value === 'string') {
    	        node.setAttribute('src', this.sanitize(value));
    	      }
    	      return node;
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      return ATTRIBUTES.reduce(function (formats, attribute) {
    	        if (domNode.hasAttribute(attribute)) {
    	          formats[attribute] = domNode.getAttribute(attribute);
    	        }
    	        return formats;
    	      }, {});
    	    }
    	  }, {
    	    key: 'match',
    	    value: function match(url) {
    	      return (/\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url)
    	      );
    	    }
    	  }, {
    	    key: 'sanitize',
    	    value: function sanitize(url) {
    	      return (0, _link.sanitize)(url, ['http', 'https', 'data']) ? url : '//:0';
    	    }
    	  }, {
    	    key: 'value',
    	    value: function value(domNode) {
    	      return domNode.getAttribute('src');
    	    }
    	  }]);

    	  return Image;
    	}(_parchment2.default.Embed);

    	Image.blotName = 'image';
    	Image.tagName = 'IMG';

    	exports.default = Image;

    	/***/ }),
    	/* 73 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _block = __webpack_require__(4);

    	var _link = __webpack_require__(27);

    	var _link2 = _interopRequireDefault(_link);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var ATTRIBUTES = ['height', 'width'];

    	var Video = function (_BlockEmbed) {
    	  _inherits(Video, _BlockEmbed);

    	  function Video() {
    	    _classCallCheck(this, Video);

    	    return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
    	  }

    	  _createClass(Video, [{
    	    key: 'format',
    	    value: function format(name, value) {
    	      if (ATTRIBUTES.indexOf(name) > -1) {
    	        if (value) {
    	          this.domNode.setAttribute(name, value);
    	        } else {
    	          this.domNode.removeAttribute(name);
    	        }
    	      } else {
    	        _get(Video.prototype.__proto__ || Object.getPrototypeOf(Video.prototype), 'format', this).call(this, name, value);
    	      }
    	    }
    	  }], [{
    	    key: 'create',
    	    value: function create(value) {
    	      var node = _get(Video.__proto__ || Object.getPrototypeOf(Video), 'create', this).call(this, value);
    	      node.setAttribute('frameborder', '0');
    	      node.setAttribute('allowfullscreen', true);
    	      node.setAttribute('src', this.sanitize(value));
    	      return node;
    	    }
    	  }, {
    	    key: 'formats',
    	    value: function formats(domNode) {
    	      return ATTRIBUTES.reduce(function (formats, attribute) {
    	        if (domNode.hasAttribute(attribute)) {
    	          formats[attribute] = domNode.getAttribute(attribute);
    	        }
    	        return formats;
    	      }, {});
    	    }
    	  }, {
    	    key: 'sanitize',
    	    value: function sanitize(url) {
    	      return _link2.default.sanitize(url);
    	    }
    	  }, {
    	    key: 'value',
    	    value: function value(domNode) {
    	      return domNode.getAttribute('src');
    	    }
    	  }]);

    	  return Video;
    	}(_block.BlockEmbed);

    	Video.blotName = 'video';
    	Video.className = 'ql-video';
    	Video.tagName = 'IFRAME';

    	exports.default = Video;

    	/***/ }),
    	/* 74 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.FormulaBlot = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _embed = __webpack_require__(35);

    	var _embed2 = _interopRequireDefault(_embed);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var FormulaBlot = function (_Embed) {
    	  _inherits(FormulaBlot, _Embed);

    	  function FormulaBlot() {
    	    _classCallCheck(this, FormulaBlot);

    	    return _possibleConstructorReturn(this, (FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot)).apply(this, arguments));
    	  }

    	  _createClass(FormulaBlot, null, [{
    	    key: 'create',
    	    value: function create(value) {
    	      var node = _get(FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot), 'create', this).call(this, value);
    	      if (typeof value === 'string') {
    	        window.katex.render(value, node, {
    	          throwOnError: false,
    	          errorColor: '#f00'
    	        });
    	        node.setAttribute('data-value', value);
    	      }
    	      return node;
    	    }
    	  }, {
    	    key: 'value',
    	    value: function value(domNode) {
    	      return domNode.getAttribute('data-value');
    	    }
    	  }]);

    	  return FormulaBlot;
    	}(_embed2.default);

    	FormulaBlot.blotName = 'formula';
    	FormulaBlot.className = 'ql-formula';
    	FormulaBlot.tagName = 'SPAN';

    	var Formula = function (_Module) {
    	  _inherits(Formula, _Module);

    	  _createClass(Formula, null, [{
    	    key: 'register',
    	    value: function register() {
    	      _quill2.default.register(FormulaBlot, true);
    	    }
    	  }]);

    	  function Formula() {
    	    _classCallCheck(this, Formula);

    	    var _this2 = _possibleConstructorReturn(this, (Formula.__proto__ || Object.getPrototypeOf(Formula)).call(this));

    	    if (window.katex == null) {
    	      throw new Error('Formula module requires KaTeX.');
    	    }
    	    return _this2;
    	  }

    	  return Formula;
    	}(_module2.default);

    	exports.FormulaBlot = FormulaBlot;
    	exports.default = Formula;

    	/***/ }),
    	/* 75 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.CodeToken = exports.CodeBlock = undefined;

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _parchment = __webpack_require__(0);

    	var _parchment2 = _interopRequireDefault(_parchment);

    	var _quill = __webpack_require__(5);

    	var _quill2 = _interopRequireDefault(_quill);

    	var _module = __webpack_require__(9);

    	var _module2 = _interopRequireDefault(_module);

    	var _code = __webpack_require__(13);

    	var _code2 = _interopRequireDefault(_code);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var SyntaxCodeBlock = function (_CodeBlock) {
    	  _inherits(SyntaxCodeBlock, _CodeBlock);

    	  function SyntaxCodeBlock() {
    	    _classCallCheck(this, SyntaxCodeBlock);

    	    return _possibleConstructorReturn(this, (SyntaxCodeBlock.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock)).apply(this, arguments));
    	  }

    	  _createClass(SyntaxCodeBlock, [{
    	    key: 'replaceWith',
    	    value: function replaceWith(block) {
    	      this.domNode.textContent = this.domNode.textContent;
    	      this.attach();
    	      _get(SyntaxCodeBlock.prototype.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock.prototype), 'replaceWith', this).call(this, block);
    	    }
    	  }, {
    	    key: 'highlight',
    	    value: function highlight(_highlight) {
    	      var text = this.domNode.textContent;
    	      if (this.cachedText !== text) {
    	        if (text.trim().length > 0 || this.cachedText == null) {
    	          this.domNode.innerHTML = _highlight(text);
    	          this.domNode.normalize();
    	          this.attach();
    	        }
    	        this.cachedText = text;
    	      }
    	    }
    	  }]);

    	  return SyntaxCodeBlock;
    	}(_code2.default);

    	SyntaxCodeBlock.className = 'ql-syntax';

    	var CodeToken = new _parchment2.default.Attributor.Class('token', 'hljs', {
    	  scope: _parchment2.default.Scope.INLINE
    	});

    	var Syntax = function (_Module) {
    	  _inherits(Syntax, _Module);

    	  _createClass(Syntax, null, [{
    	    key: 'register',
    	    value: function register() {
    	      _quill2.default.register(CodeToken, true);
    	      _quill2.default.register(SyntaxCodeBlock, true);
    	    }
    	  }]);

    	  function Syntax(quill, options) {
    	    _classCallCheck(this, Syntax);

    	    var _this2 = _possibleConstructorReturn(this, (Syntax.__proto__ || Object.getPrototypeOf(Syntax)).call(this, quill, options));

    	    if (typeof _this2.options.highlight !== 'function') {
    	      throw new Error('Syntax module requires highlight.js. Please include the library on the page before Quill.');
    	    }
    	    var timer = null;
    	    _this2.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
    	      clearTimeout(timer);
    	      timer = setTimeout(function () {
    	        _this2.highlight();
    	        timer = null;
    	      }, _this2.options.interval);
    	    });
    	    _this2.highlight();
    	    return _this2;
    	  }

    	  _createClass(Syntax, [{
    	    key: 'highlight',
    	    value: function highlight() {
    	      var _this3 = this;

    	      if (this.quill.selection.composing) return;
    	      this.quill.update(_quill2.default.sources.USER);
    	      var range = this.quill.getSelection();
    	      this.quill.scroll.descendants(SyntaxCodeBlock).forEach(function (code) {
    	        code.highlight(_this3.options.highlight);
    	      });
    	      this.quill.update(_quill2.default.sources.SILENT);
    	      if (range != null) {
    	        this.quill.setSelection(range, _quill2.default.sources.SILENT);
    	      }
    	    }
    	  }]);

    	  return Syntax;
    	}(_module2.default);

    	Syntax.DEFAULTS = {
    	  highlight: function () {
    	    if (window.hljs == null) return null;
    	    return function (text) {
    	      var result = window.hljs.highlightAuto(text);
    	      return result.value;
    	    };
    	  }(),
    	  interval: 1000
    	};

    	exports.CodeBlock = SyntaxCodeBlock;
    	exports.CodeToken = CodeToken;
    	exports.default = Syntax;

    	/***/ }),
    	/* 76 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>";

    	/***/ }),
    	/* 77 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>";

    	/***/ }),
    	/* 78 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>";

    	/***/ }),
    	/* 79 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>";

    	/***/ }),
    	/* 80 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <g class=\"ql-fill ql-color-label\"> <polygon points=\"6 6.868 6 6 5 6 5 7 5.942 7 6 6.868\"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points=\"6.817 5 6 5 6 6 6.38 6 6.817 5\"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points=\"4 11.439 4 11 3 11 3 12 3.755 12 4 11.439\"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points=\"4.63 10 4 10 4 11 4.192 11 4.63 10\"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points=\"13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174\"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points=\"12 6.868 12 6 11.62 6 12 6.868\"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points=\"12.933 9 13 9 13 8 12.495 8 12.933 9\"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points=\"5.5 13 9 5 12.5 13\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>";

    	/***/ }),
    	/* 81 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=4 y=5></rect> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=11 y=5></rect> <path class=\"ql-even ql-fill ql-stroke\" d=M7,8c0,4.031-3,5-3,5></path> <path class=\"ql-even ql-fill ql-stroke\" d=M14,8c0,4.031-3,5-3,5></path> </svg>";

    	/***/ }),
    	/* 82 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>";

    	/***/ }),
    	/* 83 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>";

    	/***/ }),
    	/* 84 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-color-label ql-stroke ql-transparent\" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points=\"5.5 11 9 3 12.5 11\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>";

    	/***/ }),
    	/* 85 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"3 11 5 9 3 7 3 11\"></polygon> <line class=\"ql-stroke ql-fill\" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>";

    	/***/ }),
    	/* 86 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"15 12 13 10 15 8 15 12\"></polygon> <line class=\"ql-stroke ql-fill\" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>";

    	/***/ }),
    	/* 87 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>";

    	/***/ }),
    	/* 88 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>";

    	/***/ }),
    	/* 89 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>";

    	/***/ }),
    	/* 90 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform=\"translate(24 18) rotate(-180)\"/> </svg>";

    	/***/ }),
    	/* 91 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>";

    	/***/ }),
    	/* 92 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>";

    	/***/ }),
    	/* 93 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>";

    	/***/ }),
    	/* 94 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>";

    	/***/ }),
    	/* 95 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class=\"ql-even ql-fill\" points=\"5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12\"></polyline> </svg>";

    	/***/ }),
    	/* 96 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=\"ql-fill ql-stroke\" points=\"3 7 3 11 5 9 3 7\"></polyline> </svg>";

    	/***/ }),
    	/* 97 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"5 7 5 11 3 9 5 7\"></polyline> </svg>";

    	/***/ }),
    	/* 98 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class=\"ql-even ql-stroke\" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class=\"ql-even ql-stroke\" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>";

    	/***/ }),
    	/* 99 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class=\"ql-stroke ql-thin\" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class=\"ql-stroke ql-thin\" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class=\"ql-stroke ql-thin\" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>";

    	/***/ }),
    	/* 100 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>";

    	/***/ }),
    	/* 101 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points=\"3 4 4 5 6 3\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points=\"3 14 4 15 6 13\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"3 9 4 10 6 8\"></polyline> </svg>";

    	/***/ }),
    	/* 102 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>";

    	/***/ }),
    	/* 103 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>";

    	/***/ }),
    	/* 104 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-stroke ql-thin\" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>";

    	/***/ }),
    	/* 105 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>";

    	/***/ }),
    	/* 106 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>";

    	/***/ }),
    	/* 107 */
    	/***/ (function(module, exports) {

    	module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=ql-stroke points=\"7 11 9 13 11 11 7 11\"></polygon> <polygon class=ql-stroke points=\"7 7 9 5 11 7 7 7\"></polygon> </svg>";

    	/***/ }),
    	/* 108 */
    	/***/ (function(module, exports, __webpack_require__) {


    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports.default = exports.BubbleTooltip = undefined;

    	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	var _extend = __webpack_require__(3);

    	var _extend2 = _interopRequireDefault(_extend);

    	var _emitter = __webpack_require__(8);

    	var _emitter2 = _interopRequireDefault(_emitter);

    	var _base = __webpack_require__(43);

    	var _base2 = _interopRequireDefault(_base);

    	var _selection = __webpack_require__(15);

    	var _icons = __webpack_require__(41);

    	var _icons2 = _interopRequireDefault(_icons);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    	var TOOLBAR_CONFIG = [['bold', 'italic', 'link'], [{ header: 1 }, { header: 2 }, 'blockquote']];

    	var BubbleTheme = function (_BaseTheme) {
    	  _inherits(BubbleTheme, _BaseTheme);

    	  function BubbleTheme(quill, options) {
    	    _classCallCheck(this, BubbleTheme);

    	    if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
    	      options.modules.toolbar.container = TOOLBAR_CONFIG;
    	    }

    	    var _this = _possibleConstructorReturn(this, (BubbleTheme.__proto__ || Object.getPrototypeOf(BubbleTheme)).call(this, quill, options));

    	    _this.quill.container.classList.add('ql-bubble');
    	    return _this;
    	  }

    	  _createClass(BubbleTheme, [{
    	    key: 'extendToolbar',
    	    value: function extendToolbar(toolbar) {
    	      this.tooltip = new BubbleTooltip(this.quill, this.options.bounds);
    	      this.tooltip.root.appendChild(toolbar.container);
    	      this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
    	      this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
    	    }
    	  }]);

    	  return BubbleTheme;
    	}(_base2.default);

    	BubbleTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
    	  modules: {
    	    toolbar: {
    	      handlers: {
    	        link: function link(value) {
    	          if (!value) {
    	            this.quill.format('link', false);
    	          } else {
    	            this.quill.theme.tooltip.edit();
    	          }
    	        }
    	      }
    	    }
    	  }
    	});

    	var BubbleTooltip = function (_BaseTooltip) {
    	  _inherits(BubbleTooltip, _BaseTooltip);

    	  function BubbleTooltip(quill, bounds) {
    	    _classCallCheck(this, BubbleTooltip);

    	    var _this2 = _possibleConstructorReturn(this, (BubbleTooltip.__proto__ || Object.getPrototypeOf(BubbleTooltip)).call(this, quill, bounds));

    	    _this2.quill.on(_emitter2.default.events.EDITOR_CHANGE, function (type, range, oldRange, source) {
    	      if (type !== _emitter2.default.events.SELECTION_CHANGE) return;
    	      if (range != null && range.length > 0 && source === _emitter2.default.sources.USER) {
    	        _this2.show();
    	        // Lock our width so we will expand beyond our offsetParent boundaries
    	        _this2.root.style.left = '0px';
    	        _this2.root.style.width = '';
    	        _this2.root.style.width = _this2.root.offsetWidth + 'px';
    	        var lines = _this2.quill.getLines(range.index, range.length);
    	        if (lines.length === 1) {
    	          _this2.position(_this2.quill.getBounds(range));
    	        } else {
    	          var lastLine = lines[lines.length - 1];
    	          var index = _this2.quill.getIndex(lastLine);
    	          var length = Math.min(lastLine.length() - 1, range.index + range.length - index);
    	          var _bounds = _this2.quill.getBounds(new _selection.Range(index, length));
    	          _this2.position(_bounds);
    	        }
    	      } else if (document.activeElement !== _this2.textbox && _this2.quill.hasFocus()) {
    	        _this2.hide();
    	      }
    	    });
    	    return _this2;
    	  }

    	  _createClass(BubbleTooltip, [{
    	    key: 'listen',
    	    value: function listen() {
    	      var _this3 = this;

    	      _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'listen', this).call(this);
    	      this.root.querySelector('.ql-close').addEventListener('click', function () {
    	        _this3.root.classList.remove('ql-editing');
    	      });
    	      this.quill.on(_emitter2.default.events.SCROLL_OPTIMIZE, function () {
    	        // Let selection be restored by toolbar handlers before repositioning
    	        setTimeout(function () {
    	          if (_this3.root.classList.contains('ql-hidden')) return;
    	          var range = _this3.quill.getSelection();
    	          if (range != null) {
    	            _this3.position(_this3.quill.getBounds(range));
    	          }
    	        }, 1);
    	      });
    	    }
    	  }, {
    	    key: 'cancel',
    	    value: function cancel() {
    	      this.show();
    	    }
    	  }, {
    	    key: 'position',
    	    value: function position(reference) {
    	      var shift = _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'position', this).call(this, reference);
    	      var arrow = this.root.querySelector('.ql-tooltip-arrow');
    	      arrow.style.marginLeft = '';
    	      if (shift === 0) return shift;
    	      arrow.style.marginLeft = -1 * shift - arrow.offsetWidth / 2 + 'px';
    	    }
    	  }]);

    	  return BubbleTooltip;
    	}(_base.BaseTooltip);

    	BubbleTooltip.TEMPLATE = ['<span class="ql-tooltip-arrow"></span>', '<div class="ql-tooltip-editor">', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-close"></a>', '</div>'].join('');

    	exports.BubbleTooltip = BubbleTooltip;
    	exports.default = BubbleTheme;

    	/***/ }),
    	/* 109 */
    	/***/ (function(module, exports, __webpack_require__) {

    	module.exports = __webpack_require__(63);


    	/***/ })
    	/******/ ])["default"];
    	});
    	});

    	var Quill = unwrapExports(quill);

    	function quill$1(node, options) {
    	  const quill = new Quill(node, {
    	    modules: {
    	      toolbar: [
    	        [{ header: [1, 2, 3, false] }],
    	        ["bold", "italic", "underline", "strike"],
    	        ["link", "code-block"]
    	      ]
    	    },
    	    placeholder: "Type something...",
    	    theme: "snow", // or 'bubble'
    	    ...options
    	  });
    	  const container = node.getElementsByClassName("ql-editor")[0];

    	  quill.on("text-change", function(delta, oldDelta, source) {
    	    node.dispatchEvent(
    	      new CustomEvent("text-change", {
    	        detail: {
    	          html: container.innerHTML,
    	          text: quill.getText()
    	        }
    	      })
    	    );
    	  });
    	}

    	exports.quill = quill$1;

    	Object.defineProperty(exports, '__esModule', { value: true });

    })));
    });

    /* src\Java\managerdetail.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\Java\\managerdetail.svelte";

    // (193:8) {:else}
    function create_else_block_2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "title");
    			attr_dev(input, "class", "svelte-j2t9x1");
    			add_location(input, file$1, 193, 10, 5766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*resultTitle*/ ctx[3]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_2*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultTitle*/ 8 && input.value !== /*resultTitle*/ ctx[3]) {
    				set_input_value(input, /*resultTitle*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(193:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (191:8) {#if no == 0}
    function create_if_block_3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "title");
    			attr_dev(input, "class", "svelte-j2t9x1");
    			add_location(input, file$1, 191, 10, 5682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*resultTitle*/ ctx[3]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultTitle*/ 8 && input.value !== /*resultTitle*/ ctx[3]) {
    				set_input_value(input, /*resultTitle*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(191:8) {#if no == 0}",
    		ctx
    	});

    	return block;
    }

    // (199:8) {:else}
    function create_else_block_1(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "id", "contentArea");
    			set_style(textarea, "display", "none");
    			add_location(textarea, file$1, 199, 10, 5979);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*content*/ ctx[5]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 32) {
    				set_input_value(textarea, /*content*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(199:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (197:8) {#if no == 0}
    function create_if_block_2(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "id", "contentArea");
    			set_style(textarea, "display", "none");
    			add_location(textarea, file$1, 197, 10, 5891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(197:8) {#if no == 0}",
    		ctx
    	});

    	return block;
    }

    // (203:12) {#if no != 0}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*resultContent*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultContent*/ 16) set_data_dev(t, /*resultContent*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(203:12) {#if no != 0}",
    		ctx
    	});

    	return block;
    }

    // (210:8) {:else}
    function create_else_block(ctx) {
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "submit");
    			attr_dev(input0, "name", "action");
    			input0.value = "수정";
    			add_location(input0, file$1, 210, 10, 6405);
    			attr_dev(input1, "type", "submit");
    			attr_dev(input1, "name", "action");
    			input1.value = "삭제";
    			add_location(input1, file$1, 211, 10, 6463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, input1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input1, "click", /*change*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(210:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (208:8) {#if no == 0}
    function create_if_block(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "submit");
    			attr_dev(input, "name", "action");
    			input.value = "저장";
    			add_location(input, file$1, 208, 10, 6330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(208:8) {#if no == 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let br0;
    	let t3;
    	let span;
    	let t4;
    	let t5;
    	let t6;
    	let div6;
    	let form;
    	let input;
    	let t7;
    	let t8;
    	let br1;
    	let br2;
    	let t9;
    	let t10;
    	let div5;
    	let t11;
    	let br3;
    	let t12;
    	let form_action_value;
    	let t13;
    	let br4;
    	let br5;
    	let br6;
    	let br7;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*no*/ ctx[0] == 0) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*no*/ ctx[0] == 0) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	let if_block2 = /*no*/ ctx[0] != 0 && create_if_block_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*no*/ ctx[0] == 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block3 = current_block_type_2(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Kim's Log";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			span = element("span");
    			t4 = text("관리자 페이지 - ");
    			t5 = text(/*division*/ ctx[1]);
    			t6 = space();
    			div6 = element("div");
    			form = element("form");
    			input = element("input");
    			t7 = text("\r\n        Title : \r\n        ");
    			if_block0.c();
    			t8 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t9 = space();
    			if_block1.c();
    			t10 = space();
    			div5 = element("div");
    			if (if_block2) if_block2.c();
    			t11 = space();
    			br3 = element("br");
    			t12 = space();
    			if_block3.c();
    			t13 = space();
    			br4 = element("br");
    			br5 = element("br");
    			br6 = element("br");
    			br7 = element("br");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$1, 172, 4, 4975);
    			add_location(h1, file$1, 177, 18, 5176);
    			add_location(br0, file$1, 178, 18, 5214);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$1, 179, 18, 5238);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$1, 176, 16, 5130);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$1, 175, 12, 5072);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$1, 174, 8, 5041);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$1, 173, 4, 5008);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$1, 171, 0, 4887);
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "id", "no");
    			add_location(input, file$1, 188, 8, 5578);
    			add_location(br1, file$1, 195, 8, 5846);
    			add_location(br2, file$1, 195, 13, 5851);
    			attr_dev(div5, "id", "editor");
    			attr_dev(div5, "class", "editor svelte-j2t9x1");
    			add_location(div5, file$1, 201, 8, 6084);
    			add_location(br3, file$1, 206, 8, 6291);
    			attr_dev(form, "id", "form");
    			attr_dev(form, "enctype", "multipart/form-data");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "action", form_action_value = "http://localhost:18080/Manager/" + /*division*/ ctx[1] + "/action/" + /*no*/ ctx[0]);
    			attr_dev(form, "class", "svelte-j2t9x1");
    			add_location(form, file$1, 187, 4, 5401);
    			attr_dev(div6, "class", "area svelte-j2t9x1");
    			add_location(div6, file$1, 186, 0, 5377);
    			add_location(br4, file$1, 215, 0, 6565);
    			add_location(br5, file$1, 215, 5, 6570);
    			add_location(br6, file$1, 215, 10, 6575);
    			add_location(br7, file$1, 215, 15, 6580);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, br0);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, form);
    			append_dev(form, input);
    			set_input_value(input, /*resultNo*/ ctx[2]);
    			append_dev(form, t7);
    			if_block0.m(form, null);
    			append_dev(form, t8);
    			append_dev(form, br1);
    			append_dev(form, br2);
    			append_dev(form, t9);
    			if_block1.m(form, null);
    			append_dev(form, t10);
    			append_dev(form, div5);
    			if (if_block2) if_block2.m(div5, null);
    			append_dev(form, t11);
    			append_dev(form, br3);
    			append_dev(form, t12);
    			if_block3.m(form, null);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, br7, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    					action_destroyer(index_umd.quill.call(null, div5, /*options*/ ctx[6])),
    					listen_dev(div5, "text-change", /*text_change_handler*/ ctx[13], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*division*/ 2) set_data_dev(t5, /*division*/ ctx[1]);

    			if (dirty & /*resultNo*/ 4) {
    				set_input_value(input, /*resultNo*/ ctx[2]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(form, t8);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(form, t10);
    				}
    			}

    			if (/*no*/ ctx[0] != 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_2(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(form, null);
    				}
    			}

    			if (dirty & /*division, no*/ 3 && form_action_value !== (form_action_value = "http://localhost:18080/Manager/" + /*division*/ ctx[1] + "/action/" + /*no*/ ctx[0])) {
    				attr_dev(form, "action", form_action_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div6);
    			if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(br7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Managerdetail', slots, []);

    	var imageHandler1 = () => {
    		var input = document.createElement('input');
    		input.setAttribute('type', 'file');
    		input.setAttribute('accept', 'image/*');
    		input.click();

    		input.addEventListener('change', async () => {
    			console.log("change");
    			var file = input.files[0];
    			var formData = new FormData();
    			formData.append('img', file);

    			fetch('http://localhost:8080/Manager/fileUpload', { method: 'POST', body: formData }).then(res => {
    				return res.json();
    			}).then(json => {
    				var uuid = json.uuid;
    				var fileName = json.fileName;

    				//var path = json.path;
    				var path = "/upload/";

    				var imgNode = document.createElement("img");
    				imgNode.src = path + uuid + "_" + fileName;
    				var range = document.getSelection().getRangeAt(0);
    				range.insertNode(imgNode);
    			});
    		});
    	};

    	const options = {
    		modules: {
    			toolbar: {
    				container: [
    					[{ 'font': [] }, { 'size': [] }],
    					['bold', 'italic', 'underline', 'strike'],
    					[{ 'color': [] }, { 'background': [] }],
    					[{ 'script': 'super' }, { 'script': 'sub' }],
    					[{ 'header': [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
    					[
    						{ 'list': 'ordered' },
    						{ 'list': 'bullet' },
    						{ 'indent': '-1' },
    						{ 'indent': '+1' }
    					],
    					['direction', { 'align': [] }],
    					['link', 'image', 'video'],
    					['clean']
    				],
    				handlers: { image: imageHandler1 }
    			}
    		},
    		placeholder: "Type something...",
    		theme: "snow"
    	};

    	let { no } = $$props;
    	let { division } = $$props;
    	let resultList = [];
    	let resultNo;
    	let resultTitle;
    	let resultContent;
    	let content;

    	onMount(async () => {
    		var test = document.location.href.split("/");
    		$$invalidate(1, division = test[4]);
    		let list = [];

    		let result = fetch('http://localhost:8080/Manager/' + division + '/update/' + no, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;
    		});

    		await result;
    		resultList = list.list;

    		if (resultList.length <= 0) {
    			$$invalidate(2, resultNo = 0);
    			$$invalidate(3, resultTitle = "");
    			$$invalidate(4, resultContent = "");
    		} else {
    			$$invalidate(2, resultNo = resultList[0].no);
    			$$invalidate(3, resultTitle = resultList[0].title);
    			$$invalidate(4, resultContent = resultList[0].content);
    		}

    		document.getElementsByClassName("ql-editor")[0].innerHTML = resultContent;
    	}); //document.getElementById("editor").innerHTML = resultContent;

    	let writer = "김광호";

    	const handleSubmit = () => {
    		document.getElementById("contentArea").value = document.getElementById("editor").children[0].innerHTML;
    		var test = document.location.href.split("/");
    		$$invalidate(1, division = test[4]);
    		let list = [];
    		let obj = {};

    		if (no >= 0) {
    			if (document.getElementById("title").value == "") {
    				alert("제목이 공백입니다.");
    				return false;
    			}
    		}

    		if (resultNo == "0") {
    			//글을 새로 쓰는 경우
    			obj = {
    				"no": "0",
    				"title": document.getElementById("title").value,
    				"content": document.getElementById("editor").children[0].innerHTML,
    				writer
    			};
    		} else {
    			//글 업데이트의 경우
    			obj = {
    				"no": resultNo,
    				"title": resultTitle,
    				"content": document.getElementById("editor").children[0].innerHTML,
    				writer
    			};
    		}

    		fetch('http://localhost:8080/Manager/' + division + '/action/' + no, {
    			method: 'POST',
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(obj)
    		}).then(res => {
    			return res.json();
    		}).then(json => {
    			list = json;

    			if (list.result == "success") {
    				alert("데이터 업데이트 완료.");
    				window.location.href = '/Manager/' + division + '/list/1';
    			} else {
    				alert("데이터 업데이트 오류. 네트워크 상태 확인 및 관리자 문의");
    			}
    		});
    	};

    	function change() {
    		$$invalidate(0, no = -no);
    	}

    	const writable_props = ['no', 'division'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Managerdetail> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		resultNo = this.value;
    		$$invalidate(2, resultNo);
    	}

    	function input_input_handler_1() {
    		resultTitle = this.value;
    		$$invalidate(3, resultTitle);
    	}

    	function input_input_handler_2() {
    		resultTitle = this.value;
    		$$invalidate(3, resultTitle);
    	}

    	function textarea_input_handler() {
    		content = this.value;
    		$$invalidate(5, content);
    	}

    	const text_change_handler = e => $$invalidate(5, content = e.detail);

    	$$self.$$set = $$props => {
    		if ('no' in $$props) $$invalidate(0, no = $$props.no);
    		if ('division' in $$props) $$invalidate(1, division = $$props.division);
    	};

    	$$self.$capture_state = () => ({
    		quill: index_umd.quill,
    		beforeUpdate,
    		onMount,
    		tick,
    		imageHandler1,
    		options,
    		no,
    		division,
    		resultList,
    		resultNo,
    		resultTitle,
    		resultContent,
    		content,
    		writer,
    		handleSubmit,
    		change
    	});

    	$$self.$inject_state = $$props => {
    		if ('imageHandler1' in $$props) imageHandler1 = $$props.imageHandler1;
    		if ('no' in $$props) $$invalidate(0, no = $$props.no);
    		if ('division' in $$props) $$invalidate(1, division = $$props.division);
    		if ('resultList' in $$props) resultList = $$props.resultList;
    		if ('resultNo' in $$props) $$invalidate(2, resultNo = $$props.resultNo);
    		if ('resultTitle' in $$props) $$invalidate(3, resultTitle = $$props.resultTitle);
    		if ('resultContent' in $$props) $$invalidate(4, resultContent = $$props.resultContent);
    		if ('content' in $$props) $$invalidate(5, content = $$props.content);
    		if ('writer' in $$props) writer = $$props.writer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		no,
    		division,
    		resultNo,
    		resultTitle,
    		resultContent,
    		content,
    		options,
    		handleSubmit,
    		change,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		textarea_input_handler,
    		text_change_handler
    	];
    }

    class Managerdetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { no: 0, division: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Managerdetail",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*no*/ ctx[0] === undefined && !('no' in props)) {
    			console_1.warn("<Managerdetail> was created without expected prop 'no'");
    		}

    		if (/*division*/ ctx[1] === undefined && !('division' in props)) {
    			console_1.warn("<Managerdetail> was created without expected prop 'division'");
    		}
    	}

    	get no() {
    		throw new Error("<Managerdetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set no(value) {
    		throw new Error("<Managerdetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get division() {
    		throw new Error("<Managerdetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set division(value) {
    		throw new Error("<Managerdetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    // (57:0) <Route path="/index">
    function create_default_slot_16(ctx) {
    	let head;
    	let t;
    	let index;
    	let current;
    	head = new Head({ $$inline: true });
    	index = new Java({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t = space();
    			create_component(index.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(index, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(index.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(index.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(index, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(57:0) <Route path=\\\"/index\\\">",
    		ctx
    	});

    	return block;
    }

    // (62:0) <Route path="/">
    function create_default_slot_15(ctx) {
    	let head;
    	let t;
    	let index;
    	let current;
    	head = new Head({ $$inline: true });
    	index = new Java({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t = space();
    			create_component(index.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(index, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(index.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(index.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(index, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(62:0) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Route path="/main">
    function create_default_slot_14(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let main;
    	let t2;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });
    	main = new Main({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(main.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(67:0) <Route path=\\\"/main\\\">",
    		ctx
    	});

    	return block;
    }

    // (74:0) <Route path="/coding">
    function create_default_slot_13(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let coding;
    	let t2;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });
    	coding = new Coding({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(coding.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(coding, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(coding.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(coding.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(coding, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(74:0) <Route path=\\\"/coding\\\">",
    		ctx
    	});

    	return block;
    }

    // (84:2) <Route path="/:page" let:meta>
    function create_default_slot_12(ctx) {
    	let bjudge;
    	let current;

    	bjudge = new Bjudge({
    			props: { page: /*meta*/ ctx[0].params.page },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bjudge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bjudge, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bjudge_changes = {};
    			if (dirty & /*meta*/ 1) bjudge_changes.page = /*meta*/ ctx[0].params.page;
    			bjudge.$set(bjudge_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bjudge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bjudge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bjudge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(84:2) <Route path=\\\"/:page\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (87:2) <Route path="/view/:no" let:meta>
    function create_default_slot_11(ctx) {
    	let bjudgepost;
    	let t0;
    	let utterances;
    	let t1;
    	let hr;
    	let current;

    	bjudgepost = new Bjudgepost({
    			props: { no: /*meta*/ ctx[0].params.no },
    			$$inline: true
    		});

    	utterances = new f({
    			props: {
    				repo: "rodvkf72/Utterances",
    				theme: "github-light",
    				issueTerm: "url"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bjudgepost.$$.fragment);
    			t0 = space();
    			create_component(utterances.$$.fragment);
    			t1 = space();
    			hr = element("hr");
    			add_location(hr, file, 93, 4, 2235);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bjudgepost, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(utterances, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bjudgepost_changes = {};
    			if (dirty & /*meta*/ 1) bjudgepost_changes.no = /*meta*/ ctx[0].params.no;
    			bjudgepost.$set(bjudgepost_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bjudgepost.$$.fragment, local);
    			transition_in(utterances.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bjudgepost.$$.fragment, local);
    			transition_out(utterances.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bjudgepost, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(utterances, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(87:2) <Route path=\\\"/view/:no\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (81:0) <Route path="/coding/b_judge/*">
    function create_default_slot_10(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let route0;
    	let t2;
    	let route1;
    	let t3;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "/:page",
    				$$slots: {
    					default: [
    						create_default_slot_12,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/view/:no",
    				$$slots: {
    					default: [
    						create_default_slot_11,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(route0.$$.fragment);
    			t2 = space();
    			create_component(route1.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(81:0) <Route path=\\\"/coding/b_judge/*\\\">",
    		ctx
    	});

    	return block;
    }

    // (103:4) <Route path="/noticeboard/list/:page" let:meta>
    function create_default_slot_9(ctx) {
    	let managerlist;
    	let current;

    	managerlist = new Managerlist({
    			props: { page: /*meta*/ ctx[0].params.page },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(managerlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managerlist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const managerlist_changes = {};
    			if (dirty & /*meta*/ 1) managerlist_changes.page = /*meta*/ ctx[0].params.page;
    			managerlist.$set(managerlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managerlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managerlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managerlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(103:4) <Route path=\\\"/noticeboard/list/:page\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (106:4) <Route path="/noticeboard/update/:no" let:meta>
    function create_default_slot_8(ctx) {
    	let managerdetail;
    	let current;

    	managerdetail = new Managerdetail({
    			props: { no: /*meta*/ ctx[0].params.no },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(managerdetail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managerdetail, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const managerdetail_changes = {};
    			if (dirty & /*meta*/ 1) managerdetail_changes.no = /*meta*/ ctx[0].params.no;
    			managerdetail.$set(managerdetail_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managerdetail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managerdetail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managerdetail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(106:4) <Route path=\\\"/noticeboard/update/:no\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (109:4) <Route path="/baekjoon/list/:page" let:meta>
    function create_default_slot_7(ctx) {
    	let managerlist;
    	let current;

    	managerlist = new Managerlist({
    			props: { page: /*meta*/ ctx[0].params.page },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(managerlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managerlist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const managerlist_changes = {};
    			if (dirty & /*meta*/ 1) managerlist_changes.page = /*meta*/ ctx[0].params.page;
    			managerlist.$set(managerlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managerlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managerlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managerlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(109:4) <Route path=\\\"/baekjoon/list/:page\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (112:4) <Route path="/baekjoon/update/:no" let:meta>
    function create_default_slot_6(ctx) {
    	let managerdetail;
    	let current;

    	managerdetail = new Managerdetail({
    			props: { no: /*meta*/ ctx[0].params.no },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(managerdetail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managerdetail, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const managerdetail_changes = {};
    			if (dirty & /*meta*/ 1) managerdetail_changes.no = /*meta*/ ctx[0].params.no;
    			managerdetail.$set(managerdetail_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managerdetail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managerdetail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managerdetail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(112:4) <Route path=\\\"/baekjoon/update/:no\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (120:4) <Route path="/main">
    function create_default_slot_5(ctx) {
    	let managermain;
    	let current;
    	managermain = new Managermain({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(managermain.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managermain, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managermain.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managermain.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managermain, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(120:4) <Route path=\\\"/main\\\">",
    		ctx
    	});

    	return block;
    }

    // (100:0) <Route path="/Manager/*">
    function create_default_slot_4(ctx) {
    	let managerhead;
    	let t0;
    	let managernav;
    	let t1;
    	let route0;
    	let t2;
    	let route1;
    	let t3;
    	let route2;
    	let t4;
    	let route3;
    	let t5;
    	let route4;
    	let t6;
    	let footer;
    	let current;
    	managerhead = new Managerhead({ $$inline: true });
    	managernav = new Managernav({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "/noticeboard/list/:page",
    				$$slots: {
    					default: [
    						create_default_slot_9,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/noticeboard/update/:no",
    				$$slots: {
    					default: [
    						create_default_slot_8,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/baekjoon/list/:page",
    				$$slots: {
    					default: [
    						create_default_slot_7,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/baekjoon/update/:no",
    				$$slots: {
    					default: [
    						create_default_slot_6,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/main",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(managerhead.$$.fragment);
    			t0 = space();
    			create_component(managernav.$$.fragment);
    			t1 = space();
    			create_component(route0.$$.fragment);
    			t2 = space();
    			create_component(route1.$$.fragment);
    			t3 = space();
    			create_component(route2.$$.fragment);
    			t4 = space();
    			create_component(route3.$$.fragment);
    			t5 = space();
    			create_component(route4.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managerhead, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(managernav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managerhead.$$.fragment, local);
    			transition_in(managernav.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managerhead.$$.fragment, local);
    			transition_out(managernav.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managerhead, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(managernav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(100:0) <Route path=\\\"/Manager/*\\\">",
    		ctx
    	});

    	return block;
    }

    // (126:0) <Route path="/project">
    function create_default_slot_3(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let project;
    	let t2;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });
    	project = new Project({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(project.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(project, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(project.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(project.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(project, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(126:0) <Route path=\\\"/project\\\">",
    		ctx
    	});

    	return block;
    }

    // (136:4) <Route path="/:page" let:meta>
    function create_default_slot_2(ctx) {
    	let noticeboard;
    	let current;

    	noticeboard = new Noticeboard({
    			props: { page: /*meta*/ ctx[0].params.page },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(noticeboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noticeboard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const noticeboard_changes = {};
    			if (dirty & /*meta*/ 1) noticeboard_changes.page = /*meta*/ ctx[0].params.page;
    			noticeboard.$set(noticeboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noticeboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noticeboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noticeboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(136:4) <Route path=\\\"/:page\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (139:4) <Route path="/view/:page" let:meta>
    function create_default_slot_1(ctx) {
    	let noticeboardpost;
    	let t;
    	let utterances;
    	let current;

    	noticeboardpost = new Noticeboardpost({
    			props: { page: /*meta*/ ctx[0].params.page },
    			$$inline: true
    		});

    	utterances = new f({
    			props: {
    				repo: "rodvkf72/Utterances",
    				theme: "github-light",
    				issueTerm: "url"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(noticeboardpost.$$.fragment);
    			t = space();
    			create_component(utterances.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noticeboardpost, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(utterances, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const noticeboardpost_changes = {};
    			if (dirty & /*meta*/ 1) noticeboardpost_changes.page = /*meta*/ ctx[0].params.page;
    			noticeboardpost.$set(noticeboardpost_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noticeboardpost.$$.fragment, local);
    			transition_in(utterances.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noticeboardpost.$$.fragment, local);
    			transition_out(utterances.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noticeboardpost, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(utterances, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(139:4) <Route path=\\\"/view/:page\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (133:0) <Route path="/noticeboard/*">
    function create_default_slot(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let route0;
    	let t2;
    	let route1;
    	let t3;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "/:page",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/view/:page",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ meta }) => ({ 0: meta }),
    						({ meta }) => meta ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(route0.$$.fragment);
    			t2 = space();
    			create_component(route1.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(133:0) <Route path=\\\"/noticeboard/*\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let t4;
    	let route5;
    	let t5;
    	let route6;
    	let t6;
    	let route7;
    	let t7;
    	let route8;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/index",
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/main",
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/coding",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/coding/b_judge/*",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "/Manager/*",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route6 = new Route({
    			props: {
    				path: "/project",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route7 = new Route({
    			props: {
    				path: "/noticeboard/*",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route8 = new Route({ props: { path: "/test" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    			t5 = space();
    			create_component(route6.$$.fragment);
    			t6 = space();
    			create_component(route7.$$.fragment);
    			t7 = space();
    			create_component(route8.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(route7, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(route8, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    			const route6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route6_changes.$$scope = { dirty, ctx };
    			}

    			route6.$set(route6_changes);
    			const route7_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route7_changes.$$scope = { dirty, ctx };
    			}

    			route7.$set(route7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			transition_in(route8.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(route7, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(route8, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		meta: O,
    		Route,
    		Utterances: f,
    		axios,
    		Index: Java,
    		Head,
    		Nav,
    		Footer,
    		Main,
    		Coding,
    		Bjudge,
    		Bjudgepost,
    		Project,
    		Noticeboard,
    		Noticeboardpost,
    		ManagerHead: Managerhead,
    		ManagerNav: Managernav,
    		ManagerMain: Managermain,
    		ManagerList: Managerlist,
    		ManagerDetail: Managerdetail
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
