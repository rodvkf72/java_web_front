<script context="module">
    import { writable } from 'svelte/store';

    const storedToken = localStorage.getItem("tokenStorage");
    export const tokenStorage = writable(storedToken);

    let list = [];

    const loginSubmit = async() => {
        let obj = {};
        
        obj = {
            "id" : document.getElementById("id").value,
            "pw" : document.getElementById("pw").value
        }
        let login = fetch('http://localhost:8080/Manage/login',
            {
                method: 'POST',
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(obj)
            }
        ).then((res) => {
            return res.json();
        }).then((json) => {
            list = json;
        })
        await login;
        if (list.result == 'empty') {
            alert("아이디 또는 비밀번호를 확인하세요.");
        } else {
            tokenStorage.subscribe(value => {
                localStorage.setItem("tokenStorage", value = list.result);
            })
            window.location.href="http://localhost:4000/Manage/main";
        }
    }
</script>

<br><br><br><br><br><br><br><br><br><br>
<div class="area">
    <form id="form" enctype="multipart/form-data" method="post" action="http://localhost:8080/login" on:submit|preventDefault={loginSubmit}>
        <input type="text" name="id" id="id"/>
        <input type="password" name="pw" id="pw"/>
        
        <input type="submit" value="로그인"/>
    </form>
</div>