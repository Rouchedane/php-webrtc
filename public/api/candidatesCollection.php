<?php
include ("pdo_connect.php");

$candidate = $_POST['candidate'];
$type = $_POST['type'];
$roomId = $_POST['roomId'];

if($type=="caller"){
    $callerCandidateRequest = $db_connect->prepare("INSERT INTO callercandidates(room_id,canditates) VALUES(?,?)");
    $check2 = $callerCandidateRequest->execute([
        $roomId,
        $candidate
    ]);
    if($check2){

        header('Content-type: application/json');
        echo json_encode(["code"=>200,"data"=>200]);

    }else{

        header('Content-type: application/json');
        echo json_encode(["code"=>201,"data"=>"erreur"]);
        die();
    }
}else if($type == "callee"){
    $callerCandidateRequest = $db_connect->prepare("INSERT INTO calleecandidates(room_id,canditates) VALUES(?,?)");
    $check2 = $callerCandidateRequest->execute([
        $roomId,
        $candidate
    ]);
    if($check2){

        header('Content-type: application/json');
        echo json_encode(["code"=>200,"data"=>200]);

    }else{
        
        header('Content-type: application/json');
        echo json_encode(["code"=>201,"data"=>"erreur"]);
        die();
    }
}



    

?>