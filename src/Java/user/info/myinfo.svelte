<link href="/Java/css/info/myinfo.css" rel="stylesheet">

<script>
import { onMount } from "svelte";

    /*
    onMount(async() => {
        document.getElementsByClassName("detaildiv")[0].style.display="none";
    })
    */
</script>

<style>
    :global(.fill) {
        object-fit: fill;
    }

    :global(.cover) {
        object-fit: cover;
    }

    .info-header {
        line-height: 0.8;
        margin:30px 0px 0px 0px;
        font-size: 24px;
    }

    .info-header-birth {
        font-size: 17px;
    }

    .info-header-sub {
        font-size: 14px;
        color: grey;
    }

    .info-body-title {
        margin:30px 0px 0px 0px;
    }

    .info-body-content {
        margin:10px 0px 0px 0px;
        font-size: 14px;
        color: grey;
    }
</style>

<header class="masthead" style="background-image: url('/resources/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
            <div class="site-heading">
            <h2>Bottle Collector's Log</h2>
            <br>
            <span class="subheading">맥주병을 수집하는 개발자</span>
            </div>
        </div>
      </div>
    </div>
</header>

<!-- Main Content -->
<div class="cover">
    <div class="row">
        <div class="col-lg-12 col-md-12 mb-12 center">
            <p class="info-header">
                <b>Kim Kwang Ho </b><span class="info-header-birth">(95.01.25)</span>
                <br>
                <span class="info-header-sub">WEB Back-End Programmer</span>
            </p>
            <hr width="20%">
        </div>
        <br>
        <div class="col-lg-2 col-md-2"></div>
        <div class="col-lg-4 col-md-4 mb-6 center">
            <br>
            <div class="col-lg-12 col-md-12 mb-6 center">
                <p class="info-body-title"><b>Introduce</b></p>
                <hr width="20%">
                <p class="info-body-content">맥주병을 수집하는 개발자 입니다~</p>
            </div>
            <br>
            <div class="col-lg-12 col-md-12 mb-6 center">
                <p class="info-body-title"><b>Information</b></p>
                <hr width="20%">
                <p class="info-body-content"><b>[2022.11 ~ 현재] 교보정보통신 디지털사업4팀</b></p>
                <p class="info-body-content">[2021.02 ~ 2022.02] iActs 개발실</p>
                <p class="info-body-content">[2014.03 ~ 2021.02] 동의대학교 컴퓨터소프트웨어공학</p>
                <p class="info-body-content">[2011.03 ~ 2014.02] 혜광고등학교 자연계열</p>
            </div>
        </div>
        <div class="col-lg-4 col-md-4 mb-6 center">
            <br>
            <div class="col-lg-12 col-md-12 mb-6 center">
                <p class="info-body-title"><b>Language & Database</b></p>
                <hr width="20%">
                <p class="info-body-content">
                    <img src="https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=java&logoColor=white" alt="Java" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white" alt="Spring" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white" alt="Go" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript" style="width: 60px; height: 30px;">
                </p>
                <p class="info-body-content">
                    <img src="https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" alt="MariaDB" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/MSSQL-F80000.svg?&style=for-the-badge&logo=microsoftsqlserver&logoColor=white" alt="MSSQL" style="width: 60px; height: 30px;">
                </p>
            </div>
            <br>
            <div class="col-lg-12 col-md-12 mb-6 center">
                <p class="info-body-title"><b>Tools</b></p>
                <hr width="20%">
                <p class="info-body-content">
                    <img src="https://img.shields.io/badge/Eclipse-2C2255.svg?&style=for-the-badge&logo=eclipseide&logoColor=white" alt="Eclipse" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/VSCode-5C2D91.svg?&style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="VisualStudioCode" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/Android-3DDC84.svg?&style=for-the-badge&logo=android&logoColor=white" alt="Android" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/Git-F05032.svg?&style=for-the-badge&logo=git&logoColor=white" alt="Git" style="width: 60px; height: 30px;">
                </p>
                <p class="info-body-content">
                    <img src="https://img.shields.io/badge/jira-0052CC.svg?&style=for-the-badge&logo=jira&logoColor=white" alt="Jira" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/slack-4A154B.svg?&style=for-the-badge&logo=slack&logoColor=white" alt="Slack" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/Notion-000000.svg?&style=for-the-badge&logo=notion&logoColor=white" alt="Notion" style="width: 60px; height: 30px;">
                    <img src="https://img.shields.io/badge/FileZilla-BF0000.svg?&style=for-the-badge&logo=filezilla&logoColor=white" alt="FileZilla" style="width: 60px; height: 30px;">
                </p>
            </div>
        </div>
        <div class="col-lg-2 col-md-2"></div>
    </div>
</div>
<br>
<br>
<hr>