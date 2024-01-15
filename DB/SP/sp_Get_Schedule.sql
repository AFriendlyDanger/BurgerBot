CREATE PROCEDURE 'sp_Get_Schedule' (IN i_time VARCHAR(255))
BEGIN
select * from schedule where scheduled_time = i_time and active = 1
END