<!-- Java -->
<script>
    import {Route} from 'tinro';
    import Index from './Java/index.svelte';
    import Head from './Java/head.svelte';
    import Nav from './Java/nav.svelte';
    import Footer from './Java/footer.svelte';
    import Main from './Java/main.svelte';
    import axios from 'axios';

    let status;
</script>

<style>
  
</style>

<Route path="/index">
  <Head/>
  <Index/>
</Route>

<Route path="/">
  <Head/>
  <Index/>
</Route>

<Route path="/main">
  <Head/>
  <Nav/>
  <Main/>
  <Footer/>
</Route>

<!--
<Route path="/">
  <Head/>
  <Nav/>
  <Main/>
  <Footer/>
</Route>
-->

<Route path="/test">

</Route>