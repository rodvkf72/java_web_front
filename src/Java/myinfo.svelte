<link href="/Java/css/info/myinfo.css" rel="stylesheet">

<script>
import { onMount } from "svelte";


    onMount(async() => {
        document.getElementsByClassName("detaildiv")[0].style.display="none";
    })
</script>

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

<br>
<br>
<!-- Main Content -->
<div class="cover hanna-font">
    <div class="row">
        <div class="col-lg-4 col-md-4 mb-2"></div>
        <div class="col-lg-2 col-md-2 mb-1 simple"><button class="simplebtn" onclick="simple()">간략한 소개</button></div>
        <div class="col-lg-2 col-md-2 mb-1 detail"><button class="detailbtn" onclick="detail()">이력서 소개</button></div>
        <div class="col-lg-4 col-md-4 mb-2"></div>
        <br><br><br><br>
        <div class="col-lg-1 col-md-6 mb-1"></div>
        
        <div class="col-lg-2 col-md-6 mb-2 simplelink">
            <div class="rinks" style="font-size: 20px;">
                <b style="font-size: 25px; color: rgba(11, 68, 175, 0.6);">Link's</b><hr width="20%;">
                <a href="https://github.com/rodvkf72">Github.</a><br>
                <a href="https://nice-pigeon-244.notion.site/Notion-b8486f6878a447b1b4aeaeddb3128b2c">Notion.</a>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3 simpledivcol1">
            <img style="width:60%; height:50%; border-radius: 10px;" src="./Java/image/bottles.jpeg" alt="맥주병's">
            <br><br>
            <span style="color:grey;">맥주병수집가</span><br>
            <b style="font-size: 40px; color:rgba(11, 68, 175, 0.6);">개발자</b><br>
            <b>김광호</b> 입니다.
        </div>
        <div class="col-lg-2 col-md-6 mb-2 simpledivcol2">
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">김광호 / Kim Kwang Ho</b><br>
                <span style="font-size:15px; color:grey;">1995.01.25 / 부산광역시</span><br>
                <br>
                Email. <a href="mailto:rodvkf72@naver.com">rodvkf72@naver.com</a>
                <hr>
            </div>
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">CAREER</b><br>
                <br>
                - 2021. 동의대학교 컴퓨터소프트웨어공학과 졸업 (학사)
                <br>
                - 2022. SI 웹 백엔드 개발 (1년)
                <hr>
            </div>
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">ABOUT</b><br>
                <br>
                학부 시절 중 메일 시스템 유지/보수 프로젝트에서 백엔드 비즈니스 로직 개발/수정, 데이터 가공에 흥미를 가지게 되어 백엔드 개발자를 목표로 하고 있습니다.
            </div>
        </div>
        <div class="col-lg-2 col-md-6 mb-2 simpledivcol3">
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">LANGUAGE</b>
                <br><br>
                - Java
                <br>
                - Go
                <hr>
            </div>
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">FRAMEWORK</b>
                <br><br>
                - Spring (Java)
                <br>
                - Echo (Go)
                <hr>
            </div>
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">DATABASE</b>
                <br><br>
                - MySQL
                <br>
                - Oracle
                <hr>
            </div>
            <div>
                <b style="font-size:20px; color:rgba(11, 68, 175, 0.6);">ENVIRONMENT</b>
                <br><br>
                - Oracle Cloud
                <br>
                - Docker
            </div>
        </div>
        <div class="col-lg-7 col-md-6 mb-7 detaildiv">
            <div class="col-lg-1 col-md-6 mb-1" style="display:inline-block;"></div>
            <div class="col-lg-3 col-md-6 mb-3 detaildivcol1">
                <div>
                    <span style="font-size:30px;">김 광 호</span>
                    <br>
                    <span style="color:orange;">백엔드 개발자</span>
                </div>
            </div>
            <div class="col-lg-7 col-md-6 mb-7 detaildivcol2">
                <hr style="border-color:black; border-top: 3px solid; margin-left:0; width:100%; padding-right:16%; display:inline-block;">
                <div>
                    <span style="font-size:20px;"><b>김광호</b></span><br>
                    부산광역시<br>
                    <br>
                    <span style="color:orange">rodvkf72@naver.com</span><br>
                </div>
            </div>
            <div class="col-lg-1 col-md-6 mb-1" style="display:inline-block;"></div>
            <br>
            <hr style="border-color:black; border-top: 3px solid; margin-left:11%; width:4%; display:inline-block;">
            <hr style="border-color:black; border-top: 3px solid; margin-left:21%; width:63%; display:inline-block;">
            <div class="col-lg-1 col-md-6 mb-1" style="display:inline-block;"></div>
            <div class="col-lg-3 col-md-6 mb-3 detaildivcol1">
                <div>
                    기술
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-md-6 mb-2"></div>
    </div>
</div>
<br>
<br>