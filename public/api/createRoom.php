<?php
include ("pdo_connect.php");

$roomKey = uniqid();
$offerType = $_POST['type'];
$offerSdp = $_POST['sdp'];
$roomId = null;

$roomRequest = $db_connect->prepare("INSERT INTO room(roomKey) VALUES(?)");
$roomIdRequest = $db_connect->prepare("SELECT id FROM room WHERE roomKey = ?");
$offerRequest = $db_connect->prepare("INSERT INTO offers(room_id,type,sdp) VALUES(?,?,?)");

$check = $roomRequest->execute([
    $roomKey
]);
if($check){
    $roomIdRequest->execute([
        $roomKey
    ]);
    $roomIdData = $roomIdRequest->fetch();
    if(isset($roomIdData['id']))
    {
        $roomId = $roomIdData['id'];
        $check2 = $offerRequest->execute([
            $roomId,
            $offerType,
            $offerSdp
        ]);
        if($check2){
            $data = [
                "roomKey"=>$roomKey,
                "offerType"=>$offerType,
                "roomId"=>$roomId,
                "offerSdp"=>$offerSdp
            ];
            header('Content-type: application/json');
            echo json_encode(["code"=>200,"data"=>$data]);
            
        }else{
            header('Content-type: application/json');
            echo json_encode(["code"=>201,"data"=>"erreur"]);
            die();
        }

    }else{
        header('Content-type: application/json');
        echo json_encode(["code"=>201,"data"=>"erreur"]);
        die();
    }
}






?>