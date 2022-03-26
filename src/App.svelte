<!-- Java -->
<script>
    import {onMount} from 'svelte';
    import {Route} from 'tinro';

    import axios from 'axios';

    import Index from './Java/index.svelte';
    import Head from './Java/head.svelte';
    import Nav from './Java/nav.svelte';
    import Footer from './Java/footer.svelte';
    import Main from './Java/main.svelte';
    import Coding from './Java/coding.svelte';
    import Bjudge from './Java/bjudge.svelte';
    import Bjudgepost from './Java/bjudgepost.svelte';

    //axios.get('http://localhost:8080/b_judge/view/1000').then((Response) => { console.log(Response.data); }).catch((Error) => { console.log(Error); })
    
    /*
    onMount(async() => {
      const res = await fetch('http://localhost:8080/b_judge/1',
        {
          method: 'POST',
          headers: {
            "Content-Type" : "application/json",
          }
        }
      )
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        list = json;
      })
    })
    */
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

<Route path="/coding">
  <Head/>
  <Nav/>
  <Coding/>
  <Footer/>
</Route>

<Route path="/coding/b_judge/*">
  <Head/>
  <Nav/>
  <Route path="/:page" let:meta>
    <Bjudge page={meta.params.page}/>
  </Route>
  <Footer/>
</Route>


<Route path="/coding/b_judge/detail/*">
  <Route path="/:id" let:meta>
    <Head/>
    <Nav/>
    <script>
      var headers = new Headers();
      console.log(headers.get('no'));
    </script>
    <Bjudgepost/>
    <Footer/>
    <!--{meta.params.id}-->
  </Route>
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