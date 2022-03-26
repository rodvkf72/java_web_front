
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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

    function p(e,a=!1){return e=e.slice(e.startsWith("/#")?2:0,e.endsWith("/*")?-2:void 0),e.startsWith("/")||(e="/"+e),e==="/"&&(e=""),a&&!e.endsWith("/")&&(e+="/"),e}function d(e,a){e=p(e,!0),a=p(a,!0);let r=[],n={},t=!0,s=e.split("/").map(o=>o.startsWith(":")?(r.push(o.slice(1)),"([^\\/]+)"):o).join("\\/"),c=a.match(new RegExp(`^${s}$`));return c||(t=!1,c=a.match(new RegExp(`^${s}`))),c?(r.forEach((o,h)=>n[o]=c[h+1]),{exact:t,params:n,part:c[0].slice(0,-1)}):null}function x(e,a,r){if(r==="")return e;if(r[0]==="/")return r;let n=c=>c.split("/").filter(o=>o!==""),t=n(e),s=a?n(a):[];return "/"+s.map((c,o)=>t[o]).join("/")+"/"+r}function m(e,a,r,n){let t=[a,"data-"+a].reduce((s,c)=>{let o=e.getAttribute(c);return r&&e.removeAttribute(c),o===null?s:o},!1);return !n&&t===""?!0:t||n||!1}function S(e){let a=e.split("&").map(r=>r.split("=")).reduce((r,n)=>{let t=n[0];if(!t)return r;let s=n.length>1?n[n.length-1]:!0;return typeof s=="string"&&s.includes(",")&&(s=s.split(",")),r[t]===void 0?r[t]=[s]:r[t].push(s),r},{});return Object.entries(a).reduce((r,n)=>(r[n[0]]=n[1].length>1?n[1]:n[1][0],r),{})}function M(e){return Object.entries(e).map(([a,r])=>r?r===!0?a:`${a}=${Array.isArray(r)?r.join(","):r}`:null).filter(a=>a).join("&")}function w(e,a){return e?a+e:""}function k(e){throw new Error("[Tinro] "+e)}var i={HISTORY:1,HASH:2,MEMORY:3,OFF:4,run(e,a,r,n){return e===this.HISTORY?a&&a():e===this.HASH?r&&r():n&&n()},getDefault(){return !window||window.location.pathname==="srcdoc"?this.MEMORY:this.HISTORY}};var y,$,H,b="",l=E();function E(){let e=i.getDefault(),a,r=c=>window.onhashchange=window.onpopstate=y=null,n=c=>a&&a(R(e)),t=c=>{c&&(e=c),r(),e!==i.OFF&&i.run(e,o=>window.onpopstate=n,o=>window.onhashchange=n)&&n();},s=c=>{let o=Object.assign(R(e),c);return o.path+w(M(o.query),"?")+w(o.hash,"#")};return {mode:t,get:c=>R(e),go(c,o){_(e,c,o),n();},start(c){a=c,t();},stop(){a=null,t(i.OFF);},set(c){this.go(s(c),!c.path);},methods(){return j(this)},base:c=>b=c}}function _(e,a,r){!r&&($=H);let n=t=>history[`${r?"replace":"push"}State`]({},"",t);i.run(e,t=>n(b+a),t=>n(`#${a}`),t=>y=a);}function R(e){let a=window.location,r=i.run(e,t=>(b?a.pathname.replace(b,""):a.pathname)+a.search+a.hash,t=>String(a.hash.slice(1)||"/"),t=>y||"/"),n=r.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);return H=r,{url:r,from:$,path:n[1]||"",query:S(n[2]||""),hash:n[3]||""}}function j(e){let a=()=>e.get().query,r=c=>e.set({query:c}),n=c=>r(c(a())),t=()=>e.get().hash,s=c=>e.set({hash:c});return {hash:{get:t,set:s,clear:()=>s("")},query:{replace:r,clear:()=>r(""),get(c){return c?a()[c]:a()},set(c,o){n(h=>(h[c]=o,h));},delete(c){n(o=>(o[c]&&delete o[c],o));}}}}var f=T();function T(){let{subscribe:e}=writable(l.get(),a=>{l.start(a);let r=P(l.go);return ()=>{l.stop(),r();}});return {subscribe:e,goto:l.go,params:Q,meta:O,useHashNavigation:a=>l.mode(a?i.HASH:i.HISTORY),mode:{hash:()=>l.mode(i.HASH),history:()=>l.mode(i.HISTORY),memory:()=>l.mode(i.MEMORY)},base:l.base,location:l.methods()}}function P(e){let a=r=>{let n=r.target.closest("a[href]"),t=n&&m(n,"target",!1,"_self"),s=n&&m(n,"tinro-ignore"),c=r.ctrlKey||r.metaKey||r.altKey||r.shiftKey;if(t=="_self"&&!s&&!c&&n){let o=n.getAttribute("href").replace(/^\/#/,"");/^\/\/|^#|^[a-zA-Z]+:/.test(o)||(r.preventDefault(),e(o.startsWith("/")?o:n.href.replace(window.location.origin,"")));}};return addEventListener("click",a),()=>removeEventListener("click",a)}function Q(){return getContext("tinro").meta.params}var g="tinro",K=v({pattern:"",matched:!0});function q(e){let a=getContext(g)||K;(a.exact||a.fallback)&&k(`${e.fallback?"<Route fallback>":`<Route path="${e.path}">`}  can't be inside ${a.fallback?"<Route fallback>":`<Route path="${a.path||"/"}"> with exact path`}`);let r=e.fallback?"fallbacks":"childs",n=writable({}),t=v({fallback:e.fallback,parent:a,update(s){t.exact=!s.path.endsWith("/*"),t.pattern=p(`${t.parent.pattern||""}${s.path}`),t.redirect=s.redirect,t.firstmatch=s.firstmatch,t.breadcrumb=s.breadcrumb,t.match();},register:()=>(t.parent[r].add(t),async()=>{t.parent[r].delete(t),t.parent.activeChilds.delete(t),t.router.un&&t.router.un(),t.parent.match();}),show:()=>{e.onShow(),!t.fallback&&t.parent.activeChilds.add(t);},hide:()=>{e.onHide(),t.parent.activeChilds.delete(t);},match:async()=>{t.matched=!1;let{path:s,url:c,from:o,query:h}=t.router.location,u=d(t.pattern,s);if(!t.fallback&&u&&t.redirect&&(!t.exact||t.exact&&u.exact)){let A=x(s,t.parent.pattern,t.redirect);return f.goto(A,!0)}t.meta=u&&{from:o,url:c,query:h,match:u.part,pattern:t.pattern,breadcrumbs:t.parent.meta&&t.parent.meta.breadcrumbs.slice()||[],params:u.params,subscribe:n.subscribe},t.breadcrumb&&t.meta&&t.meta.breadcrumbs.push({name:t.breadcrumb,path:u.part}),n.set(t.meta),u&&!t.fallback&&(!t.exact||t.exact&&u.exact)&&(!t.parent.firstmatch||!t.parent.matched)?(e.onMeta(t.meta),t.parent.matched=!0,t.show()):t.hide(),u&&t.showFallbacks();}});return setContext(g,t),onMount(()=>t.register()),t}function O(){return hasContext(g)?getContext(g).meta:k("meta() function must be run inside any `<Route>` child component only")}function v(e){let a={router:{},exact:!1,pattern:null,meta:null,parent:null,fallback:!1,redirect:!1,firstmatch:!1,breadcrumb:null,matched:!1,childs:new Set,activeChilds:new Set,fallbacks:new Set,async showFallbacks(){if(!this.fallback&&(await tick(),this.childs.size>0&&this.activeChilds.size==0||this.childs.size==0&&this.fallbacks.size>0)){let r=this;for(;r.fallbacks.size==0;)if(r=r.parent,!r)return;r&&r.fallbacks.forEach(n=>{if(n.redirect){let t=x("/",n.parent.pattern,n.redirect);f.goto(t,!0);}else n.show();});}},start(){this.router.un||(this.router.un=f.subscribe(r=>{this.router.location=r,this.pattern!==null&&this.match();}));},match(){this.showFallbacks();}};return Object.assign(a,e),a.start(),a}

    /* node_modules\tinro\cmp\Route.svelte generated by Svelte v3.46.4 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*params*/ 2,
    	meta: dirty & /*meta*/ 4
    });

    const get_default_slot_context = ctx => ({
    	params: /*params*/ ctx[1],
    	meta: /*meta*/ ctx[2]
    });

    // (33:0) {#if showContent}
    function create_if_block(ctx) {
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:0) {#if showContent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showContent*/ ctx[0] && create_if_block(ctx);

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
    					if_block = create_if_block(ctx);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
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
    			id: create_fragment$9.name
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

    /* src\Java\index.svelte generated by Svelte v3.46.4 */

    const file$8 = "src\\Java\\index.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(meta0, file$8, 1, 2, 17);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, shrink-to-fit=no");
    			add_location(meta1, file$8, 2, 2, 43);
    			attr_dev(meta2, "name", "description");
    			attr_dev(meta2, "content", "");
    			add_location(meta2, file$8, 3, 2, 133);
    			attr_dev(meta3, "name", "author");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file$8, 4, 2, 173);
    			attr_dev(link0, "href", "/Java/vendor/blog/bootstrap/css/bootstrap.min.css");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$8, 7, 2, 241);
    			attr_dev(link1, "href", "/Java/vendor/blog/fontawesome-free/css/all.min.css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file$8, 10, 2, 370);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic");
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			add_location(link2, file$8, 11, 2, 471);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800");
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			add_location(link3, file$8, 12, 2, 594);
    			attr_dev(link4, "href", "/Java/css/blog/clean-blog.min.css");
    			attr_dev(link4, "rel", "stylesheet");
    			add_location(link4, file$8, 15, 2, 810);
    			attr_dev(link5, "href", "/Java/css/blog/custom.css");
    			attr_dev(link5, "rel", "stylesheet");
    			add_location(link5, file$8, 16, 2, 878);
    			attr_dev(link6, "href", "/Java/css/comming/coming-soon.css");
    			attr_dev(link6, "rel", "stylesheet");
    			add_location(link6, file$8, 17, 2, 938);
    			attr_dev(link7, "href", "/Java/css/comming/coming-soon.min.css");
    			attr_dev(link7, "rel", "stylesheet");
    			add_location(link7, file$8, 18, 2, 1006);
    			if (!src_url_equal(script0.src, script0_src_value = "/Java/vendor/comming/jquery/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$8, 21, 2, 1120);
    			if (!src_url_equal(script1.src, script1_src_value = "/Java/vendor/comming/bootstrap/js/bootstrap.bundle.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$8, 22, 2, 1189);
    			document.title = "Preparing Blog";
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$8, 27, 2, 1333);
    			if (!src_url_equal(source.src, source_src_value = "/Java/mp4/bg.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$8, 29, 4, 1449);
    			video.playsInline = "playsinline";
    			video.autoplay = "autoplay";
    			video.muted = "muted";
    			video.loop = "loop";
    			add_location(video, file$8, 28, 2, 1364);
    			attr_dev(div1, "class", "masthead-bg");
    			add_location(div1, file$8, 33, 4, 1543);
    			attr_dev(h1, "class", "mb-3");
    			add_location(h1, file$8, 38, 12, 1758);
    			add_location(strong0, file$8, 39, 42, 1833);
    			add_location(strong1, file$8, 39, 78, 1869);
    			attr_dev(p0, "class", "mb-5");
    			add_location(p0, file$8, 39, 12, 1803);
    			add_location(strong2, file$8, 40, 28, 1937);
    			add_location(strong3, file$8, 40, 71, 1980);
    			attr_dev(p1, "class", "mb-5");
    			add_location(p1, file$8, 40, 12, 1921);
    			add_location(br, file$8, 42, 13, 2093);
    			attr_dev(p2, "class", "mb-5");
    			add_location(p2, file$8, 41, 12, 2027);
    			add_location(p3, file$8, 44, 12, 2173);
    			attr_dev(input0, "name", "id");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "Input ID...");
    			attr_dev(input0, "aria-label", "Input ID...");
    			attr_dev(input0, "aria-discribedby", "submit-button");
    			add_location(input0, file$8, 47, 14, 2330);
    			attr_dev(input1, "name", "pw");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "placeholder", "Input PW...");
    			attr_dev(input1, "aria-label", "Input PW...");
    			attr_dev(input1, "aria-discribedby", "submit-button");
    			add_location(input1, file$8, 48, 14, 2468);
    			attr_dev(input2, "class", "btn btn-secondary");
    			attr_dev(input2, "type", "submit");
    			attr_dev(input2, "id", "submit-button");
    			input2.value = "관리자 접속";
    			add_location(input2, file$8, 49, 14, 2622);
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "action", "http://localhost:8080/login");
    			add_location(form, file$8, 46, 13, 2257);
    			attr_dev(div2, "class", "input-group input-group-newsletter");
    			add_location(div2, file$8, 45, 12, 2194);
    			attr_dev(div3, "class", "masthead-content text-white py-5 py-md-0");
    			add_location(div3, file$8, 37, 10, 1690);
    			attr_dev(div4, "class", "col-12 my-auto");
    			add_location(div4, file$8, 36, 8, 1650);
    			attr_dev(div5, "class", "row h-100");
    			add_location(div5, file$8, 35, 6, 1617);
    			attr_dev(div6, "class", "container h-100");
    			add_location(div6, file$8, 34, 4, 1580);
    			attr_dev(div7, "class", "masthead");
    			add_location(div7, file$8, 32, 2, 1515);
    			attr_dev(i0, "class", "fas fa-envelope");
    			add_location(i0, file$8, 69, 10, 3431);
    			attr_dev(a0, "href", "mailto:rodvkf72@naver.com");
    			add_location(a0, file$8, 68, 8, 3383);
    			attr_dev(li0, "class", "list-unstyled-item");
    			add_location(li0, file$8, 67, 6, 3342);
    			attr_dev(i1, "class", "fab fa-github");
    			add_location(i1, file$8, 74, 10, 3588);
    			attr_dev(a1, "href", "https://github.com/rodvkf72");
    			add_location(a1, file$8, 73, 8, 3538);
    			attr_dev(li1, "class", "list-unstyled-item");
    			add_location(li1, file$8, 72, 6, 3497);
    			attr_dev(ul, "class", "list-unstyled text-center mb-0");
    			add_location(ul, file$8, 66, 4, 3291);
    			attr_dev(div8, "class", "social-icons");
    			add_location(div8, file$8, 65, 2, 3259);
    			add_location(body, file$8, 26, 0, 1323);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Java",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\Java\head.svelte generated by Svelte v3.46.4 */

    const file$7 = "src\\Java\\head.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(meta0, file$7, 2, 2, 19);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, shrink-to-fit=no");
    			add_location(meta1, file$7, 3, 2, 45);
    			attr_dev(meta2, "name", "description");
    			attr_dev(meta2, "content", "");
    			add_location(meta2, file$7, 4, 2, 135);
    			attr_dev(meta3, "name", "author");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file$7, 5, 2, 175);
    			if (!src_url_equal(script0.src, script0_src_value = "/Java/vendor/comming/jquery/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$7, 7, 2, 212);
    			attr_dev(link0, "href", "/Java/vendor/blog/bootstrap/css/bootstrap.min.css");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$7, 10, 2, 314);
    			attr_dev(link1, "href", "/Java/vendor/blog/fontawesome-free/css/all.min.css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file$7, 13, 2, 443);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic");
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			add_location(link2, file$7, 14, 2, 544);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800");
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			add_location(link3, file$7, 15, 2, 667);
    			attr_dev(link4, "href", "/Java/css/blog/clean-blog.min.css");
    			attr_dev(link4, "rel", "stylesheet");
    			add_location(link4, file$7, 18, 2, 883);
    			attr_dev(link5, "href", "/Java/css/blog/custom.css");
    			attr_dev(link5, "rel", "stylesheet");
    			add_location(link5, file$7, 19, 2, 951);
    			if (!src_url_equal(script1.src, script1_src_value = "/Java/vendor/comming/bootstrap/js/bootstrap.bundle.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$7, 22, 2, 1053);
    			if (!src_url_equal(script2.src, script2_src_value = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$7, 23, 2, 1138);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Head",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Java\nav.svelte generated by Svelte v3.46.4 */

    const file$6 = "src\\Java\\nav.svelte";

    function create_fragment$6(ctx) {
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
    	let script;
    	let t11;
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
    			script = element("script");
    			script.textContent = "function goPost() {\r\n                var f = document.createElement('form');\r\n                f.setAttribute('method', 'post');\r\n                f.setAttribute('action', 'http://localhost:8080/b_judge/1');\r\n                document.body.appendChild(f);\r\n                f.submit();\r\n              }";
    			t11 = space();
    			a4 = element("a");
    			a4.textContent = "Online Judge";
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "/main");
    			add_location(a0, file$6, 5, 6, 135);
    			attr_dev(i, "class", "fas fa-bars");
    			add_location(i, file$6, 8, 8, 424);
    			attr_dev(button, "class", "navbar-toggler navbar-toggler-right");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarResponsive");
    			attr_dev(button, "aria-controls", "navbarResponsive");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$6, 6, 6, 193);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "/main");
    			add_location(a1, file$6, 13, 12, 624);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$6, 12, 10, 589);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "href", "/noticeboard");
    			add_location(a2, file$6, 16, 12, 729);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$6, 15, 10, 694);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "/project");
    			add_location(a3, file$6, 19, 12, 848);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file$6, 18, 10, 813);
    			add_location(script, file$6, 22, 12, 959);
    			attr_dev(a4, "class", "nav-link");
    			attr_dev(a4, "href", "javascript:goPost();");
    			add_location(a4, file$6, 31, 12, 1318);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file$6, 21, 10, 924);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file$6, 11, 8, 546);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarResponsive");
    			add_location(div0, file$6, 10, 6, 476);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$6, 4, 4, 104);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light fixed-top");
    			attr_dev(nav, "id", "mainNav");
    			add_location(nav, file$6, 3, 0, 25);
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
    			append_dev(li3, script);
    			append_dev(li3, t11);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Java\footer.svelte generated by Svelte v3.46.4 */

    const file$5 = "src\\Java\\footer.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(i0, file$5, 9, 18, 315);
    			attr_dev(i1, "class", "fab fa-twitter fa-stack-1x fa-inverse");
    			add_location(i1, file$5, 10, 18, 376);
    			attr_dev(span0, "class", "fa-stack fa-lg");
    			add_location(span0, file$5, 8, 16, 266);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$5, 7, 14, 236);
    			attr_dev(li0, "class", "list-inline-item");
    			add_location(li0, file$5, 6, 12, 191);
    			attr_dev(i2, "class", "fas fa-circle fa-stack-2x");
    			add_location(i2, file$5, 17, 18, 631);
    			attr_dev(i3, "class", "fab fa-facebook-f fa-stack-1x fa-inverse");
    			add_location(i3, file$5, 18, 18, 692);
    			attr_dev(span1, "class", "fa-stack fa-lg");
    			add_location(span1, file$5, 16, 16, 582);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$5, 15, 14, 552);
    			attr_dev(li1, "class", "list-inline-item");
    			add_location(li1, file$5, 14, 12, 507);
    			attr_dev(i4, "class", "fas fa-circle fa-stack-2x");
    			add_location(i4, file$5, 25, 18, 976);
    			attr_dev(i5, "class", "fab fa-github fa-stack-1x fa-inverse");
    			add_location(i5, file$5, 26, 18, 1037);
    			attr_dev(span2, "class", "fa-stack fa-lg");
    			add_location(span2, file$5, 24, 16, 927);
    			attr_dev(a2, "href", "https://github.com/rodvkf72");
    			add_location(a2, file$5, 23, 14, 871);
    			attr_dev(li2, "class", "list-inline-item");
    			add_location(li2, file$5, 22, 12, 826);
    			attr_dev(ul, "class", "list-inline text-center");
    			add_location(ul, file$5, 5, 10, 141);
    			attr_dev(p, "class", "copyright text-muted");
    			add_location(p, file$5, 31, 10, 1182);
    			attr_dev(div0, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div0, file$5, 4, 8, 89);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$5, 3, 6, 62);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$5, 2, 4, 31);
    			add_location(footer, file$5, 1, 0, 17);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Java\main.svelte generated by Svelte v3.46.4 */

    const file$4 = "src\\Java\\main.svelte";

    function create_fragment$4(ctx) {
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
    	let br6;
    	let t12;
    	let br7;
    	let t13;
    	let p1;
    	let t15;
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
    			t10 = text("\r\n                    Java, Spring Boot, mybatis, Mysql을 사용하였습니다.");
    			br3 = element("br");
    			br4 = element("br");
    			t11 = text("\r\n                    디자인은 Bootstrap Template을 사용하였습니다.");
    			br5 = element("br");
    			br6 = element("br");
    			t12 = text("\r\n                    구성요소로는 게시판, 진행했던 프로젝트, 온라인 저지 문제 풀이가 있습니다.");
    			br7 = element("br");
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Made By KHKI";
    			t15 = space();
    			hr1 = element("hr");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$4, 1, 4, 88);
    			add_location(h1, file$4, 6, 18, 289);
    			add_location(br0, file$4, 7, 18, 327);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$4, 8, 18, 351);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$4, 5, 16, 243);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$4, 4, 12, 185);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$4, 3, 8, 154);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$4, 2, 4, 121);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$4, 0, 0, 0);
    			attr_dev(h2, "class", "post-title");
    			set_style(h2, "text-align", "center");
    			add_location(h2, file$4, 20, 16, 678);
    			set_style(hr0, "width", "10%");
    			add_location(hr0, file$4, 23, 16, 796);
    			add_location(br1, file$4, 25, 59, 951);
    			add_location(br2, file$4, 25, 63, 955);
    			add_location(br3, file$4, 26, 63, 1024);
    			add_location(br4, file$4, 26, 67, 1028);
    			add_location(br5, file$4, 27, 53, 1087);
    			add_location(br6, file$4, 27, 57, 1091);
    			add_location(br7, file$4, 28, 62, 1159);
    			attr_dev(p0, "class", "post-subtitle");
    			set_style(p0, "text-align", "center");
    			add_location(p0, file$4, 24, 16, 838);
    			attr_dev(p1, "class", "post-meta");
    			set_style(p1, "text-align", "center");
    			add_location(p1, file$4, 30, 16, 1203);
    			attr_dev(div5, "class", "post-preview");
    			add_location(div5, file$4, 19, 12, 634);
    			add_location(hr1, file$4, 32, 12, 1301);
    			attr_dev(div6, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div6, file$4, 18, 8, 580);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$4, 17, 4, 553);
    			attr_dev(div8, "class", "container");
    			add_location(div8, file$4, 16, 0, 524);
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
    			append_dev(p0, br6);
    			append_dev(p0, t12);
    			append_dev(p0, br7);
    			append_dev(div5, t13);
    			append_dev(div5, p1);
    			append_dev(div6, t15);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Java\coding.svelte generated by Svelte v3.46.4 */

    const file$3 = "src\\Java\\coding.svelte";

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
    			add_location(div0, file$3, 2, 4, 114);
    			add_location(h1, file$3, 7, 12, 297);
    			add_location(br0, file$3, 8, 12, 327);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$3, 9, 12, 345);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$3, 6, 10, 257);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$3, 5, 8, 205);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$3, 4, 6, 178);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$3, 3, 4, 147);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$3, 1, 2, 26);
    			add_location(hr0, file$3, 20, 7, 632);
    			add_location(br1, file$3, 21, 7, 645);
    			attr_dev(a, "href", "/coding/b_judge");
    			add_location(a, file$3, 21, 11, 649);
    			add_location(br2, file$3, 21, 62, 700);
    			add_location(hr1, file$3, 70, 8, 2308);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			set_style(div5, "text-align", "center");
    			add_location(div5, file$3, 19, 6, 555);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$3, 18, 4, 530);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$3, 17, 2, 501);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Coding",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Java\bjudge.svelte generated by Svelte v3.46.4 */

    const file$2 = "src\\Java\\bjudge.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (52:12) {#each resultList as item}
    function create_each_block(ctx) {
    	let tbody;
    	let td0;
    	let hr0;
    	let t0;
    	let br0;
    	let t1_value = /*item*/ ctx[2].no + "";
    	let t1;
    	let br1;
    	let t2;
    	let t3;
    	let td1;
    	let hr1;
    	let t4;
    	let br2;
    	let a;
    	let t5_value = /*item*/ ctx[2].title + "";
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
    			add_location(hr0, file$2, 53, 20, 1411);
    			add_location(br0, file$2, 53, 30, 1421);
    			add_location(br1, file$2, 53, 43, 1434);
    			add_location(td0, file$2, 53, 16, 1407);
    			add_location(hr1, file$2, 54, 20, 1471);
    			add_location(br2, file$2, 54, 30, 1481);
    			attr_dev(a, "href", a_href_value = "/b_judge/view/" + /*item*/ ctx[2].no);
    			add_location(a, file$2, 54, 34, 1485);
    			add_location(br3, file$2, 54, 84, 1535);
    			add_location(td1, file$2, 54, 16, 1467);
    			set_style(tbody, "text-align", "center");
    			add_location(tbody, file$2, 52, 14, 1354);
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
    			if (dirty & /*resultList*/ 1 && t1_value !== (t1_value = /*item*/ ctx[2].no + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*resultList*/ 1 && t5_value !== (t5_value = /*item*/ ctx[2].title + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*resultList*/ 1 && a_href_value !== (a_href_value = "/b_judge/view/" + /*item*/ ctx[2].no)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tbody);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:12) {#each resultList as item}",
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
    			add_location(div0, file$2, 26, 4, 582);
    			add_location(h1, file$2, 31, 12, 765);
    			add_location(br, file$2, 32, 12, 791);
    			attr_dev(span, "class", "subheading");
    			add_location(span, file$2, 33, 12, 809);
    			attr_dev(div1, "class", "site-heading");
    			add_location(div1, file$2, 30, 10, 725);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$2, 29, 8, 673);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$2, 28, 6, 646);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$2, 27, 4, 615);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/home-bg.jpg')");
    			add_location(header, file$2, 25, 0, 494);
    			add_location(b0, file$2, 47, 25, 1209);
    			attr_dev(th0, "width", "30%");
    			add_location(th0, file$2, 47, 9, 1193);
    			add_location(b1, file$2, 48, 25, 1251);
    			attr_dev(th1, "width", "70%");
    			add_location(th1, file$2, 48, 9, 1235);
    			set_style(tr, "background-color", "rgb(230, 230, 230)");
    			set_style(tr, "text-align", "center");
    			add_location(tr, file$2, 46, 7, 1112);
    			add_location(thread, file$2, 45, 7, 1095);
    			attr_dev(table, "width", "100%;");
    			attr_dev(table, "id", "tbl");
    			add_location(table, file$2, 44, 8, 1056);
    			add_location(hr, file$2, 61, 8, 1667);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div5, file$2, 43, 6, 1006);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$2, 42, 4, 981);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$2, 41, 2, 952);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bjudge', slots, []);
    	let { page } = $$props;
    	let resultList = [];

    	window.onload = async function () {
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
    	};

    	const writable_props = ['page'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bjudge> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({ page, resultList });

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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { page: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bjudge",
    			options,
    			id: create_fragment$2.name
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

    /* src\Java\bjudgepost.svelte generated by Svelte v3.46.4 */

    const file$1 = "src\\Java\\bjudgepost.svelte";

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
    	let article;
    	let div7;
    	let div6;
    	let div5;
    	let t4;
    	let hr0;
    	let t5;
    	let br1;
    	let t6;
    	let br2;
    	let t7;
    	let br3;
    	let t8;
    	let hr1;
    	let t9;
    	let br4;
    	let t10;
    	let br5;
    	let t11;
    	let hr2;

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
    			h1.textContent = "TEST";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			article = element("article");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			br3 = element("br");
    			t8 = space();
    			hr1 = element("hr");
    			t9 = space();
    			br4 = element("br");
    			t10 = space();
    			br5 = element("br");
    			t11 = space();
    			hr2 = element("hr");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$1, 1, 4, 88);
    			add_location(h1, file$1, 6, 14, 273);
    			add_location(br0, file$1, 9, 12, 361);
    			attr_dev(div1, "class", "post-heading");
    			add_location(div1, file$1, 5, 10, 231);
    			attr_dev(div2, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div2, file$1, 4, 8, 179);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$1, 3, 6, 152);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$1, 2, 4, 121);
    			attr_dev(header, "class", "masthead");
    			set_style(header, "background-image", "url('/Java/image/post-bg.jpg')");
    			add_location(header, file$1, 0, 0, 0);
    			attr_dev(div5, "class", "col-lg-8 col-md-10 mx-auto");
    			add_location(div5, file$1, 22, 8, 728);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$1, 21, 6, 701);
    			add_location(hr0, file$1, 26, 6, 842);
    			add_location(br1, file$1, 27, 6, 854);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$1, 20, 4, 670);
    			add_location(article, file$1, 19, 2, 655);
    			add_location(br2, file$1, 30, 0, 886);
    			add_location(br3, file$1, 31, 0, 892);
    			add_location(hr1, file$1, 32, 0, 898);
    			add_location(br4, file$1, 33, 0, 904);
    			add_location(br5, file$1, 42, 2, 1123);
    			add_location(hr2, file$1, 43, 2, 1131);
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
    			insert_dev(target, t3, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div7, t4);
    			append_dev(div7, hr0);
    			append_dev(div7, t5);
    			append_dev(div7, br1);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, hr2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(article);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(hr2);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bjudgepost', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bjudgepost> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Bjudgepost extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bjudgepost",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    // (43:0) <Route path="/index">
    function create_default_slot_7(ctx) {
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
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(43:0) <Route path=\\\"/index\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:0) <Route path="/">
    function create_default_slot_6(ctx) {
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
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(48:0) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:0) <Route path="/main">
    function create_default_slot_5(ctx) {
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
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(53:0) <Route path=\\\"/main\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:0) <Route path="/coding">
    function create_default_slot_4(ctx) {
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
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(60:0) <Route path=\\\"/coding\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:2) <Route path="/:page" let:meta>
    function create_default_slot_3(ctx) {
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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(70:2) <Route path=\\\"/:page\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Route path="/coding/b_judge/*">
    function create_default_slot_2(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let route;
    	let t2;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });

    	route = new Route({
    			props: {
    				path: "/:page",
    				$$slots: {
    					default: [
    						create_default_slot_3,
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
    			create_component(route.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_changes = {};

    			if (dirty & /*$$scope, meta*/ 3) {
    				route_changes.$$scope = { dirty, ctx };
    			}

    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(route.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(route.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(67:0) <Route path=\\\"/coding/b_judge/*\\\">",
    		ctx
    	});

    	return block;
    }

    // (78:2) <Route path="/:id" let:meta>
    function create_default_slot_1(ctx) {
    	let head;
    	let t0;
    	let nav;
    	let t1;
    	let script;
    	let t3;
    	let bjudgepost;
    	let t4;
    	let footer;
    	let current;
    	head = new Head({ $$inline: true });
    	nav = new Nav({ $$inline: true });
    	bjudgepost = new Bjudgepost({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			script = element("script");
    			script.textContent = "var headers = new Headers();\n      console.log(headers.get('no'));";
    			t3 = space();
    			create_component(bjudgepost.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(script, file, 80, 4, 1548);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, script, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(bjudgepost, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(bjudgepost.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(bjudgepost.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(script);
    			if (detaching) detach_dev(t3);
    			destroy_component(bjudgepost, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(78:2) <Route path=\\\"/:id\\\" let:meta>",
    		ctx
    	});

    	return block;
    }

    // (77:0) <Route path="/coding/b_judge/detail/*">
    function create_default_slot(ctx) {
    	let route;
    	let current;

    	route = new Route({
    			props: {
    				path: "/:id",
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

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route_changes.$$scope = { dirty, ctx };
    			}

    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(77:0) <Route path=\\\"/coding/b_judge/detail/*\\\">",
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
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/index",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/main",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/coding",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/coding/b_judge/*",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "/coding/b_judge/detail/*",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route6 = new Route({ props: { path: "/test" }, $$inline: true });

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
    		Route,
    		axios,
    		Index: Java,
    		Head,
    		Nav,
    		Footer,
    		Main,
    		Coding,
    		Bjudge,
    		Bjudgepost
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
