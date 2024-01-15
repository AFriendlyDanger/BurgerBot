CREATE TABLE if not exists schedule (
        guild_id VARCHAR(255) NOT NULL, 
        channel_id VARCHAR(255) NOT NULL, 
        scheduled_time TIME NOT NULL, 
        active TINYINT NOT NULL DEFAULT 0, 
        failed_posts INT NOT NULL DEFAULT 0, 
        PRIMARY KEY (channel_id));

CREATE TABLE if not exists servings (
        guild_id VARCHAR(255) NOT NULL, 
        channel_id VARCHAR(255) NOT NULL, 
        burgers INT NOT NULL DEFAULT 0, 
        PRIMARY KEY (channel_id));
