<?php
include ("pdo_connect.php");

$roomId = $_POST["roomId"];

$answerRequest = $db_connect->prepare("SELECT * FROM answers WHERE room_id = ?");
$answerRequest->execute([
    $roomId
]);
$answerData = $answerRequest->fetch();
if(isset($answerData['id'])){
    $answerType  = $answerData["type"];
    $answerSdp  = $answerData["sdp"];

    $data = [
        "type"=>$answerType,
        "sdp"=>$answerSdp
    ];
    header('Content-type: application/json');
    echo json_encode(["code"=>200,"data"=>$data]);
}else{
    header('Content-type: application/json');
    echo json_encode(["code"=>201,"data"=>"erreur"]);
    die();
}

?>