CREATE PROCEDURE sp_Insert_Serving(IN i_guild_id VARCHAR(255), IN i_channel_id VARCHAR(255))
BEGIN
	INSERT INTO servings (guild_id, channel_id, burgers)
	values (i_guild_id, i_channel_id, 0)
	ON DUPLICATE KEY UPDATE burgers = burgers + 1;
END