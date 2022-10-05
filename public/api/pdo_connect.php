<?php

 try {
  //$db_connect = new PDO("mysql:host=localhost;dbname=kizi1580_kimia_dbf;charset=utf8", "kizi1580_kpfi6207", "q6ms1wro5ep1");
  $db_connect = new PDO("mysql:host=localhost;dbname=webrtc;charset=utf8", "root", "");
  //$db_connect = new PDO("mysql:host=localhost;dbname=kizi1580_ebi;charset=utf8", "kizi1580_kpfi6207", "q6ms1wro5ep1");
  // set the PDO error mode to exception
  
  
} catch(Exception $e) {
  echo "Connection failed: " . $e->getMessage();
}
 ?>
 
