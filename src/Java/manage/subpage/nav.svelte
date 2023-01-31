<script>
  import { tokenCheck } from "../../../../public/Java/js/blog/token-check";

  let result =  tokenCheck.hasToken();
  async function load() {
      return await result;
  }
</script>

{#await load()}
<nav class="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav" sytle="background-color:black">
    <div class="container">
      <a class="navbar-brand" href="/Manage/main">Kim's Log - Manager</a>
      <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
        Menu
        <i class="fas fa-bars"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarResponsive">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <a class="nav-link" href="/main">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:location.href='/Manage/projects'">Project</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:location.href='/Manage/noticeboards'">NoticeBoard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:location.href='/Manage/baekjoons'">Baekjoon</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
{/await}