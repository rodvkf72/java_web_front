<!-- Java -->
<script>
    import {meta, Route} from 'tinro';
    import {Utterances} from 'utterances-svelte-component';

    import Index from './Java/index.svelte';
    import Head from './Java/head.svelte';
    import Nav from './Java/nav.svelte';
    import Footer from './Java/footer.svelte';
    import Main from './Java/main.svelte';
    import Coding from './Java/coding.svelte';
    import Judge from './Java/judge.svelte';
    import Judgepost from './Java/judgepost.svelte';
    import Project from './Java/project.svelte';
    import Noticeboard from './Java/noticeboard.svelte';
    import Noticeboardpost from './Java/noticeboardpost.svelte';
    import ManagerHead from './Java/managerhead.svelte';
    import ManagerNav from './Java/managernav.svelte';
    import ManagerMain from './Java/managermain.svelte';
    import ManagerList from './Java/managerlist.svelte';
    import ManagerDetail from './Java/managerdetail.svelte';
    import MyInfo from './Java/myinfo.svelte';
</script>

<style>
  p img {
    width:100%;
    height:100%;
  }
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

<Route path="/coding/*">
  <Head/>
  <Nav/>
  <Route path="/:divi/*" let:meta>
    <Route path="/:page" let:meta>
      <Judge divi={meta.params.divi} page={meta.params.page}/>
    </Route>
    <Route path="/view/:no" let:meta>
      <Judgepost divi={meta.params.divi} no={meta.params.no}/>
      <Utterances
        repo="rodvkf72/Utterances"
        theme="github-light"
        issueTerm="url"
      />
      <hr>
    </Route>
  </Route>
  <Footer/>
</Route>

<!--
<Route path="/coding/b_judge/*">
  <Head/>
  <Nav/>
  <Route path="/:page" let:meta>
    <Bjudge page={meta.params.page}/>
  </Route>
  <Route path="/view/:no" let:meta>
    <Bjudgepost no={meta.params.no}/>
    <Utterances
      repo="rodvkf72/Utterances"
      theme="github-light"
      issueTerm="url"
    />
    <hr>
  </Route>
  <Footer/>
</Route>
-->

<Route path="/Manager/*">
    <ManagerHead/>
    <ManagerNav/>
    <Route path="/noticeboard/list/:page" let:meta>
      <ManagerList page={meta.params.page}/>
    </Route>
    <Route path="/noticeboard/update/:no" let:meta>
      <ManagerDetail no={meta.params.no}/>
    </Route>
    <Route path="/baekjoon/list/:page" let:meta>
      <ManagerList page={meta.params.page}/>
    </Route>
    <Route path="/baekjoon/update/:no" let:meta>
      <ManagerDetail no={meta.params.no}/>
    </Route>
    <!--
    <Route path="/:division/list" let:meta>
      <ManagerList division={meta.params.division}/>
    </Route>
    -->
    <Route path="/main">
      <ManagerMain/>
    </Route>
    <Footer/>
</Route>

<Route path="/info">
  <script>
    function simple() {
      if (document.getElementsByClassName("simpledivcol1")[0].style.display == "none") {
        document.getElementsByClassName("simpledivcol1")[0].style.display="";
        document.getElementsByClassName("simpledivcol2")[0].style.display="";
        document.getElementsByClassName("simpledivcol3")[0].style.display="";
        document.getElementsByClassName("detaildiv")[0].style.display="none";
      } else {
        document.getElementsByClassName("simpledivcol1")[0].style.display="none";
        document.getElementsByClassName("simpledivcol2")[0].style.display="none";
        document.getElementsByClassName("simpledivcol3")[0].style.display="none";
      }
    }
    function detail() {
      if (document.getElementsByClassName("detaildiv")[0].style.display == "none") {
        document.getElementsByClassName("detaildiv")[0].style.display="";
        document.getElementsByClassName("simpledivcol1")[0].style.display="none";
        document.getElementsByClassName("simpledivcol2")[0].style.display="none";
        document.getElementsByClassName("simpledivcol3")[0].style.display="none";
      } else {
        document.getElementsByClassName("detaildiv")[0].style.display="none";
      }
    }
  </script>
  <Head/>
  <Nav/>
  <MyInfo/>
  <Footer/>
</Route>

<Route path="/project">
  <Head/>
  <Nav/>
  <Project/>
  <Footer/>
</Route>

<Route path="/noticeboard/*">
    <Head/>
    <Nav/>
    <Route path="/:page" let:meta>
        <Noticeboard page={meta.params.page}/>
    </Route>
    <Route path="/view/:page" let:meta>
        <Noticeboardpost page={meta.params.page}/>
        <Utterances
          repo="rodvkf72/Utterances"
          theme="github-light"
          issueTerm="url"
        />
    </Route>
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