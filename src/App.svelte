<!-- Java -->
<script>
  import { beforeUpdate, onMount, tick } from "svelte";
  import {meta, Route} from 'tinro';
  import {Utterances} from 'utterances-svelte-component';

  import Index from './Java/index.svelte';

  import Main from './Java/user/main.svelte';
  import Head from './Java/user/header/header.svelte';
  import Nav from './Java/user/nav/nav.svelte';
  import Footer from './Java/user/footer/footer.svelte';
  import BoardList from './Java/user/board/list.svelte';
  import BoardView from './Java/user/board/view.svelte';
  import OnlinejudgeSelect from './Java/user/onlinejudge/select.svelte';
  import OnlinejudgeList from './Java/user/onlinejudge/list.svelte';
  import OnlinejudgeView from './Java/user/onlinejudge/view.svelte';
  import ProjectList from './Java/user/project/list.svelte';
  import ProjectView from "./Java/user/project/view.svelte";
  import MyInfo from './Java/user/info/myinfo.svelte';

  import ManageHead from './Java/manage/subpage/head.svelte';
  import ManageNav from './Java/manage/subpage/nav.svelte';
  import ManageMain from './Java/manage/main.svelte';
  import ManageBoardList from './Java/manage/board/list.svelte';
  import ManageBoardView from './Java/manage/board/view.svelte';
  import ManageOnlinejudgeSelect from './Java/manage/onlinejudge/select.svelte';
  import ManageOnlinejudgeList from './Java/manage/onlinejudge/list.svelte';
  import ManageOnlinejudgeView from './Java/manage/onlinejudge/view.svelte';
  import ManageProjectList from './Java/manage/project/list.svelte';
  import ManageProjectView from './Java/manage/project/view.svelte';
  import ManageLogin from './Java/manage/login/login.svelte';
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
<Nav/>
<Main/>
<Footer/>
</Route>

<Route path="/main">
<Head/>
<Nav/>
<Main/>
<Footer/>
</Route>

<Route path="/Manage/*">
  <ManageHead/>
  <ManageNav/>

  <Route path="/main">
    <ManageMain/>
  </Route>
  <Route path="/login">
    <ManageLogin/>
  </Route>

  <Route path="/board/*">
    <Route path="/">
      <ManageBoardList/>
    </Route>
    <Route path="/:no" let:meta>
      <ManageBoardView no={meta.params.no}/>
    </Route>
  </Route>

  <Route path="/onlinejudge/*">
    <Route path="/">
      <ManageOnlinejudgeSelect/>
    </Route>
    <Route path="/:divi/*" let:meta1>
      <Route path="/">
        <ManageOnlinejudgeList divi={meta1.params.divi}/>
      </Route>
      <Route path="/:no" let:meta2>
        <ManageOnlinejudgeView divi={meta1.params.divi} no={meta2.params.no}/>
      </Route>
    </Route>
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
  <ProjectList/>
  <Footer/>
</Route>

<Route path="/board/*">
  <Head/>
  <Nav/>
  <Route path="/">
    <BoardList/>
  </Route>
  <Route path="/:no" let:meta>
    <BoardView no={meta.params.no}/>
      <Utterances
        repo="rodvkf72/Utterances"
        theme="github-light"
        issueTerm="url"
      />
      <hr>
  </Route>
  <Footer/>
</Route>


<Route path="/onlinejudge/*">
  <Head/>
  <Nav/>
  <Route path="/">
    <OnlinejudgeSelect/>
  </Route>
  <Route path="/:divi/*" let:meta1>
    <Route path="/">
      <OnlinejudgeList divi={meta1.params.divi}/>
    </Route>
    <Route path="/:no" let:meta2>
      <OnlinejudgeView divi={meta1.params.divi} no={meta2.params.no}/>
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