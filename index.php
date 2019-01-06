<?php
    $path="C:\Users\wyj\Desktop\git\Html";
    $list1=glob("$path\\*.html");
?>
<html>
<head>
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
    <link rel="icon" href="images/favicon.ico">
    <title>无聊写写</title>
    <link rel="stylesheet" href="myCss.css">
    <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
	<script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
	<script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.js"></script>
</head>
<body style='font-size:20px'>
    <div class='row'>
        <div class="navbar-header">
        <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand hidden-sm" href="#" disabled>列表</a>
        </div>
        <div class="navbar-collapse collapse" role="navigation">
            <ul class="nav nav-tabs ">
                <?php foreach($list1 as $value):?>
                    <li class=""><a href="#<?=str_replace(["$path\\",'.html'],"",$value);?>"  data-toggle='tab'><?=str_replace(["$path\\",'.html'],"",$value);?></a></li>
                <?php endforeach;?>
                <li><a href="/table/index.html" target="_blank" >table</a></li>
            </ul>
        </div>
        <div class='tab-content'>
            <?php foreach($list1 as $value):?>
                <div class='tab-pane fade in ' id='<?=str_replace(["$path\\",'.html'],"",$value);?>'>
                    <?php include(str_replace("$path\\","",$value));?>
                </div>
            <?php endforeach;?>
        </div>
    </div>
</body>
<style>
    body{
        background-color:#f9f0e3;
    }
    .row{
        height: 100%;
        width:100%; 
        background-color:white;
        margin:0px !important;
    }
    .row:hover{
        box-shadow: 0px 0px 10px #11111179;
        
    }
    .nav.nav-tabs{
        background-color:black;
        border-bottom: 1px #7b7474 solid;
    }
   .navbar-header a{
        color:white;
    }
    .nav.nav-tabs a{
        color:#7b7474;
        font-weight:500;
    }
    .nav.nav-tabs li{
        border-radius:0;
    }
    .nav.nav-tabs li.active a{
        color:white;
        background-color:black;
        border-radius:0;
        border-width: 0px 0px 2px 0px ;
        border-style:solid;
        border-color:red !important;
    }
    .nav.nav-tabs li a:hover{
        border-width: 0px 0px 2px 0px ;
        border-style:solid;
        border-color:red !important;
    }
    .nav.nav-tabs a:hover{
        color:white;
        background-color:black;
        border:0px solid;
    }
    .navbar-header button{
        border: 1px #7b7474 solid;
    }
    .navbar-toggle .icon-bar{
        background-color: white;
    }
    .navbar-collapse{
            padding-left:0px;
            padding-right:0px;
            width:100%;
            position:fixed;
            z-index:1;
    }
    @media screen and (max-width:900px){
        .nav.nav-tabs li{
            float:none !important;
        }
        .navbar-header{
            background-color:black;
        }
        .navbar-header button{
            display:block;
        }
        .collapse {
            display: none;
        }
    }
   
</style>
<script>
    
</script>
</html>