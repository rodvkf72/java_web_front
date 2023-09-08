<script>
  import {onMount} from 'svelte';
  export let divi;

  let max;
  let resultList = [];
  let paging = [];

  /*
  onMount(async() => {
    resultList = [];
    paging = [];
    let list = [];
    let result = fetch('http://localhost:8080/projects/',
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/json",
        }
      }
    ).then((res) => {
      return res.json();
    }).then((json) => {
      list = json;
    });

    await result;
    resultList = list.list;
  })
  */

  $: projectList = fetch(`http://localhost:8080/project/${division}/list`,
    {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json",
      }
    }
  ).then((res) => {
    return res.json();
  }).then((result) => {
    console.log(result);
    return result;
  })

  let division = 'kyobo';

  function topic(topic) {
    division = topic;
  }
</script>

<style>
  @media (max-width: 767px) {
    .card {
      display: flex;
      justify-content: left;
      position: relative;
      width: 80%;
      line-height: 1.6;
      font-size: 0.8em;
      background-color: rgba(0, 0, 0, 0.01);
      margin: auto;
      padding: 1%;
      cursor: pointer;
    }
  }
  .card-parent {
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    position: relative;
  }

  .card {
    line-height: 1.6;
    font-size: 0.8em;
    background-color: rgba(0, 0, 0, 0.01);
    box-shadow: 0 0 0 1px #e1e1e1 inset;
    border-radius: 10px;
    cursor: pointer;
  }

  .card-body {
    padding: 1em;
  }

  .card-content {
    position: relative;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-date {
    font-size: 0.8em;
  }

  .border {
    font-size: 0.8em;
    margin: 5px;
    border: 1px;
    border-radius: 5px;
  }

  .active {
    background-color:#42454c;
    color:#fff;
    border:1px solid #42454c;
  }

  .image-box {
    width: 40%;
    height: 200px;
    display: inline-block;
  }

  .content-box {
    position: relative;
    width: 54%;
    height: 200px;
    display: inline-table;
    margin: auto;
    vertical-align: top;
  }

  .post-title {
    margin: auto;
    text-align: center;
    width: 80%;
    height: 65%;
  }

  .post-title p {
    font-size: 20px;
    text-overflow: hidden;
    margin-top: 30px;
    word-break: break-all;
  }

  .post-writer {
    margin-top: -7%;
    margin-right: -8%;
    text-align: center;
  }

  .post-writer p {
    font-size: 15px;
    text-overflow: hidden;
    color: gray;
    word-break: break-all;
  }

  .post-preview:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>

<!-- Page Header -->
<!-- <header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h2>
              프로젝트
            </h2>
            <br>
              <span class="subheading">목록</span>
          </div>
        </div>
      </div>
    </div>
  </header> -->

  <!-- Main Content -->
  <!-- <div style="width: 80%; text-align: center; margin: auto;">
    <div class="card-parent">

      {#each resultList as item}
        <div class="col-lg-3 col-md-6 mb-3 card" onClick="location.href='/board/noticeboard/view/{item.pk}'">
          <div class="card-body">
            <div class="card-title">
              <b>{item.title}</b>
            </div>
            <div class="card-content">
              {@html item.info.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
            </div>
          </div>
          <div class="card-buttom">
            <div class="card-date">
              {item.date}
            </div>
          </div>
        </div>
      {/each}

        <hr>
        <div class="clearfix">
          <div id="b_dv" style="text-align: center">
            {#each paging as item}
              <input type="button" value="{item.no}" onclick="location.href='/board/{divi}/{item.no}'">&nbsp;
            {/each}
          </div>
        </div>
      </div>
      
    </div> -->






<header class="masthead" style="background-image: url('/resources/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h2>프 로 젝 트</h2>
            <br>
            <span class="subheading">이 때 까 지 한 프 로 젝 트</span>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <div class="container">
    <div class="row">
      <!-- 좌측 공백용 -->
      <div class="col-lg-3 center">
      </div>

      {#if division == 'kyobo'}
        <div id="kyobo" class="col-lg-2 center border active" on:click={() => topic('kyobo')}>
          교보정보통신
        </div>
      {:else}
        <div id="kyobo" class="col-lg-2 center border" on:click={() => topic('kyobo')}>
          교보정보통신
        </div>
      {/if}

      {#if division == 'iacts'}
        <div id="iacts" class="col-lg-2 center border active" on:click={() => topic('iacts')}>
          iActs
        </div>
      {:else}
        <div id="iacts" class="col-lg-2 center border" on:click={() => topic('iacts')}>
          iActs
        </div>
      {/if}

      {#if division == 'etc'}
        <div id="etc" class="col-lg-2 center border active" on:click={() => topic('etc')}>
          학부 및 개인
        </div>
      {:else}
        <div id="etc" class="col-lg-2 center border" on:click={() => topic('etc')}>
          학부 및 개인
        </div>
      {/if}

      <!-- 우측 공백용 -->
      <div class="col-lg-3 center">
      </div>
    </div>

    <!--
    <hr>
    <div class="col-lg-12">
      <div class="row">
        {#await projectList}
          <div class="loading-container" id="loading-bar">
            <div class="loading"></div>
            <div id="loading-text">loading</div>
          </div>
        {:then projectList}
          {#each projectList.projectList as project, index}
            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card h-100">
                <a href="#"><img class="card-img-top" src="../../resources/image/pop_bg.png" alt=""></a>
                <div class="card-body">
                  <h4 class="card-title">
                    {project.title}
                  </h4>
                  <p class="card-text">
                    {project.startDate} ~ {project.endDate}
                  </p>
                </div>
                <div class="card-footer">
                  <small class="text-muted">완성도 : {project.complete}</small>
                </div>
              </div>
            </div>
          {/each}
        {:catch error}
          <p>서버가 아파요 ㅠㅠ</p>
        {/await}
      </div>
    </div>
    -->

    <div class="col-lg-8 col-md-10 mx-auto">
      <table width="100%;" id="tbl">
        {#await projectList}
          <div class="loading-container" id="loading-bar">
            <div class="loading"></div>
            <div id="loading-text">loading</div>
          </div>
        {:then projectList}
          {#each projectList.projectList as project, index}
            <hr>
            <div class="post-preview" onclick="location.href='/project/{project.pk}'" style="cursor: pointer;">
              <div class="image-box">
                <img src="https://blog.jinbo.net/attach/615/200937431.jpg" style="width: 100%; height: 100%;" alt="thumb"/>
              </div>
              <div class="content-box">
                <div class="post-title">
                  <p>{project.title}</p>
                </div>
                <div class="post-writer">
                  <!--<p>Posted by {item.writer} on {item.date}</p>-->
                  <p>{project.startDate} ~ endDate</p>
                </div>
              </div>
            </div>
          {/each}
        {:catch error}
          <p>서버가 아파요 ㅠㅠ</p>
        {/await}
      </table>
      <hr>
    </div>

    <!--
    <div class="row">
      <div class="col-lg-12">
        <h3 style="text-align:center">업무 프로젝트</h3>
        <hr>
        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/pop_bg.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  DBS 데이터 파이프라인 구축
                </h4>
                <p class="card-text">
                  <b>Confluent Platform(Kafka, Prometheus, Grafana, KSQL), Java, Oracle, Linux</b>
                  <br><br>
                  교보생명 DBS (Digital transformation Based Strategy) 전략 데이터 파이프라인 구축 (Confluent Platform 기반)
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : (진행 중)</small>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/pop_bg.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  LMS 시스템 고도화
                </h4>
                <p class="card-text">
                  <b>Java, Spring, JPA(QueryDSL), mybatis, jsp, MariaDB, httpd</b>
                  <br><br>
                  교보정보통신의 Learning Management System (LMS) 고도화 및 교보 그룹사에 사용될 별도의 서버 및 기능 추가 작업
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9733; (높은 내부 평가)</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>　</div>

      <div class="col-lg-12">
        <h3 style="text-align:center">진행한 프로젝트</h3>
        <hr>


        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://cashnamu.com"><img class="card-img-top" src="../../resources/image/pop_bg.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://cashnamu.com">캐시나무</a>
                </h4>
                <p class="card-text">
                  <b>Java, MySQL, jsp</b>
                  <br><br>
                  사용자가 구매한 물품의 일정 비율을 리워드 해 주는 사이트로 토이 프로젝트에서 확장된 케이스 입니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : (진행 중)</small>
              </div>
            </div>
          </div>
        
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/java_web"><img class="card-img-top" src="../../resources/image/springboot.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/java_web">개인 블로그 - Java</a>
                </h4>
                <p class="card-text">
                  <b>Java, Spring Boot, MySQL, mybatis, svelte, httpd</b>
                  <br><br>
                  현재 보고 있는 이 페이지로 Go언어로 제작한 블로그를 Java, svelte 코드로 변경하고 Bootstrap Template를 사용하여 디자인 하였습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : (진행 중)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/GO_WEB"><img class="card-img-top" src="../../resources/image/echo.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/GO_WEB">개인 블로그 - Go</a>
                </h4>
                <p class="card-text">
                  <b>Go(Echo), MySQL, Docker</b>
                  <br><br>
                  Go언어를 공부하던 중 웹 개발이 가능한 것을 알고 '웹을 만들면서 공부하면 더 학습이 잘 되지 않을까?' 라는 생각으로 제작하게 되었습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9734; &#9734; (설계 및 분석 부족)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/PayDay"><img class="card-img-top" src="../../resources/image/spring4.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/PayDay">간편결제 쇼핑몰</a>
                </h4>
                <p class="card-text">
                  <b>Java, Spring, Oracle, mybatis, Apache Tomcat</b>
                  <br><br>
                  카드를 등록하여 간단한 비밀번호 입력으로 서비스나 상품을 구매할 수 있게 하여 사용자에게 편리한 결제 방식을 제공하도록 하였습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9734; &#9734; (완성도 미흡)</small>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/building_info_competition"><img class="card-img-top" src="../../resources/image/android.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/building_info_competition">건축정보 모바일 서비스 콘텐츠 개발 공모전</a>
                </h4>
                <p class="card-text">
                  <b>Java(Android Studio), php, MySQL</b>
                  <br><br>
                  건축 대장 정보나 건축물의 상태 기입을 효율적으로 하기 위한 애플리케이션 입니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (UI/UX 미흡)</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>　</div>

      <div class="col-lg-12">
        <h3 style="text-align:center;">학부 수업 프로젝트</h3>
        <hr>


        <div class="row">
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/Makers"><img class="card-img-top" src="../../resources/image/android.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/Makers">여행 애플리케이션</a>
                </h4>
                <p class="card-text">
                  <b>Java(Android Studio), Go, MySQL</b>
                  <br><br>
                  여행 동행자 모집 및 주변 여행 정보 획득을 위한 애플리케이션 입니다. 차이점은 동행모집 게시판, 관광지 선호도, 인증 시스템이 있습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (UI/UX 미흡)</small>
              </div>
            </div>
          </div>


          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/WebMailSystem"><img class="card-img-top" src="../../resources/image/java.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/WebMailSystem">웹 메일 시스템 유지/보수</a>
                </h4>
                <p class="card-text">
                  <b>Java, jsp</b>
                  <br><br>
                  주어진 웹 메일 시스템에 대해 예방, 완전화, 수정, 적응 유지보수를 진행한 프로젝트 입니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9733; (팀원 평가에서 높은 평가)</small>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/android.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">자동 차량 결제 애플리케이션</a>
                </h4>
                <p class="card-text">
                  <b>Java(Android Studio), php, MySQL</b>
                  <br><br>
                  OCR 기술로 번호판 인식을 통해 차량으로 결제를 지원하는 애플리케이션(결제 미구현) 입니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9734; &#9734; (분석, 설계 및 UI/UX 미흡)</small>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/ros.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">자율주행 프로그램</a>
                </h4>
                <p class="card-text">
                  <b>Python, ROS(Robot Operating System), Gazebo</b>
                  <br><br>
                  주어진 미로에 대한 목적지 도착 및 백트래킹, 주행시험장 신호와 차선을 지키며 목적지에 도착하는 프로그램 입니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (완성도 미흡)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/yongjjang/Service-Center-System"><img class="card-img-top" src="../../resources/image/proc.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/yongjjang/Service-Center-System">서비스 센터 프로그램</a>
                </h4>
                <p class="card-text">
                  <b>Pro C</b>
                  <br><br>
                  가상의 전자 제품 기업을 상정하고 해당 기업에서 사용하는 서비스 소프트웨어를 개발한다는 내용이며 프로그램 기능보다는 DB의 설계와 구현에 초점을 두었습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9733; (교수님의 높은 평가)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/java.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">인사관리 프로그램</a>
                </h4>
                <p class="card-text">
                  <b>Java</b>
                  <br><br>
                  디자인 패턴을 사용하여 제작된 인사관리 프로그램 입니다. 사용된 패턴은 스트래티지 패턴, 이터레이터 패턴, 원격 프록시 패턴, 메멘토 패턴, 커맨드 패턴 입니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (평가 시 일부 항목이 배제됨)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/html.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">장르 통합형 웹 사이트</a>
                </h4>
                <p class="card-text">
                  <b>html, css, javascript, php</b>
                  <br><br>
                  사용자의 다양한 요구를 만족시키기 위해 하나에 국한되지 않는 다양한 콘텐츠를 제공하고자 하는 목적으로 제작되었습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (UI/UX 미흡)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/vuforia.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">AR 구현동화(캡스톤 보고서 형식)</a>
                </h4>
                <p class="card-text">
                  <b>Unity Vuforia</b>
                  <br><br>
                  AR로 구현동화를 만들어 양방향성의 콘텐츠로 만들어 교육 효율을 높이자는 생각으로 기획되었습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9733; (교수님의 높은 평가)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/java.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">관광지 주변시설 위치 확인 프로그램</a>
                </h4>
                <p class="card-text">
                  <b>Java</b>
                  <br><br>
                  공공 데이터 API를 활용하여 관광지에 대한 핵심정보 뿐만 아니라 주변의 편의시설, 관련정보 등을 하나의 프로그램으로 통합하였습니다.
                </p>
              </div>
              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (UI/UX 미흡)</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/mfc.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">캐릭터 달리기 게임</a>
                </h4>
                <p class="card-text">
                  <b>MFC</b>
                  <br><br>
                  쿠키런 이라는 게임을 MFC로 구현하고 몇 가지 추가사항을 더하면 더욱 재밌는 게임을 만들 수 있을 것 같다는 생각으로 제작되었습니다.
                </p>
              </div>

              <div class="card-footer">
                <small class="text-muted">완성도 : &#9733; &#9733; &#9733; &#9733; &#9734; (UI/UX 미흡)</small>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    -->
  </div>
