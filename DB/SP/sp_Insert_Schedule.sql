CREATE PROCEDURE sp_Insert_Schedule(IN i_guild_id VARCHAR(255), IN i_channel_id VARCHAR(255), IN i_time VARCHAR(255), IN i_active INT)
BEGIN
	INSERT INTO schedule (guild_id, channel_id, scheduled_time, active)
            values (i_guild_id, i_channel_id, i_time, i_active)
            ON DUPLICATE KEY UPDATE scheduled_time=VALUES(scheduled_time), active=VALUES(active);
END