<!-- Java -->
<script>
    import { beforeUpdate, onMount, tick } from "svelte";
    import {meta, Route} from 'tinro';
    import {Utterances} from 'utterances-svelte-component';

    import Index from './Java/index.svelte';

    import Main from './Java/user/main.svelte';
    import Head from './Java/user/subpage/head.svelte';
    import Nav from './Java/user/subpage/nav.svelte';
    import Footer from './Java/user/subpage/footer.svelte';
    import Coding from './Java/user/board/boardCoding.svelte';
    import Board from './Java/user/board/board.svelte';
    import BoardDetail from './Java/user/board/boardDetail.svelte';
    import Project from './Java/user/project/project.svelte';
    import ProjectDetail from "./Java/user/project/projectDetail.svelte";
    import MyInfo from './Java/user/info/myinfo.svelte';

    import NoticeboardList from './Java/user/noticeboard/list.svelte';
    import NoticeboardView from './Java/user/noticeboard/view.svelte';
    import JudgeSelect from './Java/user/judge/select.svelte';
    import JudgeList from './Java/user/judge/list.svelte';
    import JudgeView from './Java/user/judge/view.svelte';

    import ManageHead from './Java/manage/subpage/head.svelte';
    import ManageNav from './Java/manage/subpage/nav.svelte';
    import ManageMain from './Java/manage/main.svelte';
    import ManageList from './Java/manage/board/board.svelte';
    import ManageDetail from './Java/manage/board/boardDetail.svelte';
    import ManageProjectList from './Java/manage/project/project.svelte';
    import ManageProjectDetail from './Java/manage/project/projectDetail.svelte';
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
<!--
    <Route path="/projects" let:meta>
      <ManageProjectList/>
    </Route>
    <Route path="/project/:no" let:meta>
      <ManageProjectDetail page={meta.params.page}/>
    </Route>
-->

    <Route path="/:division/*" let:meta>
      <Route path="/" let:meta>
        {#if meta.params.division == 'projects'}
            <ManageProjectList division={meta.params.division}/>  
        {:else if meta.params.division == 'noticeboard'}
            <ManageList division={meta.params.division}/>
        {:else if meta.params.division == 'baekjoons'}
            <ManageList division={meta.params.division}/>
        {:else if meta.params.division == 'programmers'}
            <ManageList division={meta.params.division}/>
        {/if}
      </Route>
      <Route path="/:no" let:meta>
        {#if meta.params.division == 'project'}
          <ManageProjectDetail division={meta.params.division} no={meta.params.no}/>
        {:else}
          <ManageDetail division={meta.params.division} no={meta.params.no}/>
        {/if}
      </Route>
    </Route>

    <!--
    <Route path="/boards">
      <ManageList/>
    </Route>
    <Route path="/board/:no" let:meta>
      <ManageDetail no={meta.params.no}/>
    </Route>
    -->

    <!--
    <Route path="/noticeboards/:page" let:meta>
      <ManageList page={meta.params.page}/>
    </Route>
    <Route path="/programmerss/:page" let:meta>
      <ManageList page={meta.params.page}/>
    </Route>
    <Route path="/baekjoons/:page" let:meta>
      <ManageList page={meta.params.page}/>
    </Route>

    <Route path="/noticeboard/:page" let:meta>
      <ManageDetail page={meta.params.page}/>
    </Route>
    <Route path="/baekjoon/:page" let:meta>
      <ManageDetail page={meta.params.page}/>
    </Route>
    <Route path="/programmers/:page" let:meta>
      <ManageDetail page={meta.params.page}/>
    </Route>
    -->

    <!--
    <Route path="/:division/:page" let:meta>
      <ManageList page={meta.params.page}, division={meta.params.division}/>
    </Route>
    <Route path="/board/**">
      <ManageDetail/>
    </Route>
    -->
    <!--
    <Route path="/noticeboard/update/:no" let:meta>
      <ManageDetail no={meta.params.no}/>
    </Route>
    <Route path="/baekjoon/:page" let:meta>
      <ManageList page={meta.params.page}/>
    </Route>
    <Route path="/baekjoon/update/:no" let:meta>
      <ManageDetail no={meta.params.no}/>
    </Route>
    <Route path="/programmers/:page" let:meta>
      <ManageList no={meta.params.page}/>
    </Route>
    <Route path="/programmers/update/:no" let:meta>
      <ManageDetail no={meta.params.no}/>
    </Route>
    -->
    <Route path="/main">
      <ManageMain/>
    </Route>
    <Route path="/login">
      <ManageLogin/>
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

<Route path="/:divi/*" let:meta>
  {#if meta.params.divi =='projects'}
    <Head/>
    <Nav/>
    <Route path="/">
      <Project/>
    </Route>
    <Footer/>
  {:else if meta.params.divi == 'project'}
    <Head/>
    <Nav/>
    <Route path="/:no" let:meta>
        <ProjectDetail no={meta.params.no}/>
    </Route>
    <Footer/>
  {/if}
</Route>

<Route path="/judge/*">
  <Head/>
  <Nav/>
  <Route path="/select/">
    <JudgeSelect/>
  </Route>
  <Route path="/:divi/list/:page" let:meta>
    <JudgeList divi={meta.params.divi} page={meta.params.page}/>
  </Route>
  <Route path="/:divi/view/:no" let:meta>
    <JudgeView divi={meta.params.divi} no={meta.params.no}/>
    <Utterances
      repo="rodvkf72/Utterances"
      theme="github-light"
      issueTerm="url"
    />
    <hr>
  </Route>
  <Footer/>
</Route>

<Route path="/noticeboard/*">
  <Head/>
  <Nav/>
  <Route path="/list/:page" let:meta>
    <NoticeboardList page={meta.params.page}/>
  </Route>
  <Route path="/view/:no" let:meta>
    <NoticeboardView no={meta.params.no}/>
    <Utterances
      repo="rodvkf72/Utterances"
      theme="github-light"
      issueTerm="url"
    />
    <hr>
  </Route>
  <Footer/>
</Route>