#!/usr/bin/env php7.4
<?php
require_once('/dino/logic/sql/pdo.php');
require_once('/dino/logic/inputs/filter.php');
Use \inputs\filter as filter;
/**
 * Read me first:
 *  This file was used in production ~2 years ago. The database has changed so much none of these queries work.
 *  These are safe to relase as public. This file hasnt been updated in ~1.5 years
 * 
 * 
 * 
 *  what this script does: 
 *      rank 'posts' by time or by like count
 */
if (!http_response_code()) {
    system('clear');
    //for testing in CLI
};
class post_gen{
    protected $posts;
    public $time;
    protected $cache;
    public function __construct(int $pagination = 8,int $cachetime = 14400){
        $this->clean = new filter;
        $this->pagination = $pagination;
        $this->time = microtime(); #microtime for other functions
        global $db; #database connection
        $this->db = $db;
        $this->cache = new \Memcache;
        $this->cache->connect($_ENV['memcacheips'], 11211);
        $this->buildtime = floor(microtime(true) * 1000);
        $this->ttl = $cachetime;
    }
    public function trendingbylikesv1(int $days = 1,int $page = 1){
        if ($days <= 0) {
            return;
            //if days is less then 1, then stop the function.
        }
        $hash = "SELECT post_id,time FROM rating_info WHERE time BETWEEN 86400000 AND 86400000 AND rating_action = 'like' ORDER BY `time` DESC LIMIT ".($page * $this->pagination).",".$this->pagination.";";
        //$page and pagination are cleaned before being sent to the function, XSS safe.
        if (!$this->cache->get($hash)) {
            $data = $this->cache->get($hash);
            return json_decode($data,true);
        }else{
            $milisecondstodays = $days * 86400000;
            //86400000 = 1 full human day in miliseconds
            $beforetime = floor(microtime(true) * 1000) - $milisecondstodays;
            //remove days from current time
            $time = floor(microtime(true) * 1000);
            //current time, in seconds
            $ratings = $this->db->prepare("SELECT post_id,time FROM rating_info WHERE time BETWEEN $beforetime AND $time AND rating_action = 'like' ORDER BY `time` DESC LIMIT ".($page * $this->pagination).",".$this->pagination);
            //$page and pagination are cleaned before being sent to the function, XSS safe.
            $ratings->execute();
            $liked=$ratings->fetchall(\PDO::FETCH_ASSOC);
            //get all likes within the time range above
            $postids = [];
            for ($i=0; $i < count($liked); $i++) { 
                array_push($postids,$liked[$i]['post_id']);
            }
            //for every post id, just add the post id to the array
            $posts = [];
            $postids = array_count_values($postids);
            //convert dupe post ids into +1 values
            arsort($postids);
            //sort the values by Highest nubmer first
            foreach ($postids as $key => $value) {
                $post = $this->db->prepare("SELECT * from posts where post_id = :pid");
                $post->execute(['pid'=>$key]);
                $postdata=$post->fetch(\PDO::FETCH_ASSOC);
                $posts[] = $postdata;
            }
            //for each post, get the post data IN ORDER of the arsort.
            $this->cache->set($hash, json_encode($posts), false, $this->ttl);
            $this->posts = $posts;
            return $posts;
        }
    }
    public function trendingbyviewsv1(int $days = 1,int $page = 1){
        if ($days <= 0) {
            return;
            //if days is less then 1, then stop the function.
        }
        $milisecondstodays = $days * 60 * 60 * 24;
        //86400000 = 1 full human day in miliseconds
        $beforetime = time() - $milisecondstodays;
            //remove days from current time
        $time = time();
            //current time, in seconds
        echo $hash = "SELECT post_id FROM views WHERE time BETWEEN $beforetime AND ".($time)." ORDER BY `time`  DESC LIMIT ".($page * $this->pagination).",".$this->pagination.";";
        $ratings = $this->db->prepare("SELECT SSID,post_id,time FROM views WHERE time BETWEEN $beforetime AND $time ORDER BY `time` DESC LIMIT ".($page * $this->pagination).",".$this->pagination.";");
        $ratings->execute();
        $views=$ratings->fetchall(\PDO::FETCH_ASSOC);
            //get all likes within the time range above
        $postids = [];
        for ($i=0; $i < count($views); $i++) { 
            array_push($postids,$views[$i]['post_id']);
        }
        $posts = [];
        $postids = array_count_values($postids);
        //convert dupe post ids into +1 values
        arsort($postids);
        //sort the values by Highest nubmer first
        foreach ($postids as $key => $value) {
            $post = $this->db->prepare("SELECT * from posts where post_id = :pid");
            $post->execute(['pid'=>$key]);
            $postdata=$post->fetch(\PDO::FETCH_ASSOC);
            $posts[] = $postdata;
        }
        //for each post, get the post data IN ORDER of the arsort.
        $this->cache->set($hash, json_encode($posts), false, $this->ttl);
        $this->posts = $posts;
        return $posts;
    }
    public function trendingbycountv1(){
        # code...
    }
    public function get_alt_datav1(array $data){
        $emparray = [];
        $webuser['user_id'] = 0; //removed for privacy
        foreach($data as $row) {
            $sth = $this->db->prepare("SELECT id FROM comments WHERE post_id = :uid ORDER BY parent_id asc, date desc");
            $sth->execute(array(":uid"=>$row['post_id']));
            $sth->fetch(\PDO::FETCH_ASSOC);
            $like = $this->db->prepare("SELECT COUNT(*) as bringhome FROM rating_info WHERE post_id = :uid AND rating_action='like'");
            $like->execute(array(":uid"=>$row['post_id']));
            $dislike = $this->db->prepare("SELECT COUNT(*) as dabacon FROM rating_info WHERE post_id = :uid AND rating_action='dislike'");
            $dislike->execute(array(":uid"=>$row['post_id']));
            $likes = $like->fetch(\PDO::FETCH_ASSOC);
            $dislikes = $dislike->fetch(\PDO::FETCH_ASSOC);
            $rating = [
              'likes' => $likes['bringhome'],
              'dislikes' => $dislikes['dabacon']
            ];
            $userhash = "SELECT user_id,username,profile_icon FROM users WHERE username = ".$row['author'];
            if ($this->cache->get($userhash)) {
              $u_data = json_decode($this->cache->get($userhash),TRUE);
            } else {
              $lu_data_stmt = $this->db->prepare("SELECT user_id,username,profile_icon FROM users WHERE username = :uid");
              $lu_data_stmt->execute(array(":uid"=>$row['author']));
              $u_data=$lu_data_stmt->fetch(\PDO::FETCH_ASSOC);
              $this->cache->set($userhash, json_encode($u_data), false, 600);
            }
            $likedq = $this->db->prepare("SELECT * FROM rating_info WHERE user_id=:uid AND post_id=:pid AND rating_action='like'");
            if (!empty($webuser['user_id'])) {
              $likedq->execute(array(":uid"=>$webuser['user_id'],":pid"=>$row['post_id']));
              $liked=$likedq->fetch(\PDO::FETCH_ASSOC);
              if (!$liked) {
                $liked = false;
                $disliked = true;
              }else {
                $liked = true;
                $disliked = false;
              }
            }else{
              $liked = false;
              $disliked = true;
            }
            $emparray[] = array_merge(
                $row + 
                ['sha2' => hash('sha512/256',$row['post_id'].$row['author'])] +
                ['comments' => $sth->rowCount()] +
                ['gentime' => time()] + 
                ['genSERVER' => 'V7_r-US-S1'] +  //this is loaded from ENV
                ['server_pid' => $row["post_id"]] + 
                ['liked' => $liked] + 
                ['disliked' => $disliked]+ 
                ['picon' => $u_data['profile_icon']] + 
                ['pname' => $u_data['username']] + 
                ['poster_id' => $u_data['user_id']]+ 
                $rating
            );
        }
        return $emparray;
    }
    public static function out(array $data){
        return trim(json_encode($data));
    }
}
$var = new post_gen(50,60*60*4);
header('Content-Type: application/json; charset=utf-8');
echo post_gen::out($var->get_alt_datav1($var->trendingbylikesv1(3,0)));
