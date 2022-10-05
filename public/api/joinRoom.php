<?php
include ("pdo_connect.php");


$roomKey = $_POST["roomKey"];
$offerType = null;
$offerSdp = null;
$roomId = null;
$action = $_POST["action"];
if($action == 1 )
{
    $roomIdRequest = $db_connect->prepare("SELECT id FROM room WHERE roomKey = ?");
    $offerRequest = $db_connect->prepare("SELECT * FROM offers WHERE room_id = ?");

    $roomIdRequest->execute([
        $roomKey
    ]);
    $roomIdData = $roomIdRequest->fetch();
    if(isset($roomIdData['id']))
    {
        $roomId = $roomIdData['id'];
        $offerRequest->execute([
            $roomId
        ]);
        $offerData = $offerRequest->fetch();
        if(isset($offerData['id'])){
            $offerType  = $offerData["type"];
            $offerSdp  = $offerData["sdp"];

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
}else if($action == 2){
    $answerType = $_POST['type'];
    $answerSdp = $_POST['sdp'];
    $roomId = $_POST['roomId'];


    $answerRequest = $db_connect->prepare("INSERT INTO answers(room_id,type,sdp) VALUES(?,?,?)");
    
    $check2 = $answerRequest->execute([
        $roomId,
        $answerType,
        $answerSdp
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