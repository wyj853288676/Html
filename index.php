<?php
    $path="C:\Users\wyj\Desktop\git\Html";
    $list=glob("$path\\*.html");
?>
<html>
<head>
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
    <link rel="stylesheet" href="myCss.css">
    <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
	<script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
	<script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>
<body style='font-size:20px'>
    <div class='row'>
    <ul class="nav nav-tabs">
        <?php foreach($list as $value):?>
            <li class=""><a href="#<?=str_replace(["$path\\",'.html'],"",$value);?>" data-toggle="tab" ><?=str_replace(["$path\\",'.html'],"",$value);?></a></li>
        <?php endforeach;?>
    </ul>
    <div class='tab-content'>
        <?php foreach($list as $value):?>
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
        margin-left:10%;
        margin-top:5%;
        height: 80%;
        width:80%;
        background-color:white;
    }
    .row:hover{
        box-shadow: 0px 0px 10px #11111179;
        
    }
</style>
<script>
    
</script>
</html>