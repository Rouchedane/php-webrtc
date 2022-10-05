<?php
include ("pdo_connect.php");

$roomId = $_POST["roomId"];
$type = $_POST["type"];
if($type == "caller"){
    $candidateRequest = $db_connect->prepare("SELECT * FROM callercandidates WHERE room_id = ?");
    $candidateRequest->execute([
        $roomId
    ]);
    
    $candidateData = $candidateRequest->fetchAll();
    if(count($candidateData) > 0 ){
        header('Content-type: application/json');
        echo json_encode(["code"=>200,"data"=>$candidateData]);
    }else{
        header('Content-type: application/json');
        echo json_encode(["code"=>201,"data"=>"erreur"]);
        die();
    }

}else if($type == "callee"){
    $candidateRequest = $db_connect->prepare("SELECT * FROM calleecandidates WHERE room_id = ?");
    $candidateRequest->execute([
        $roomId
    ]);
    
    $candidateData = $candidateRequest->fetchAll();
    if(count($candidateData) > 0 ){
        header('Content-type: application/json');
        echo json_encode(["code"=>200,"data"=>$candidateData]);
    }else{
        header('Content-type: application/json');
        echo json_encode(["code"=>201,"data"=>"erreur"]);
        die();
    }
}


?>