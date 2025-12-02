SELECT
	DISTINCT ON (serial_mdvr)
	COALESCE(serial_mdvr, 'N/A') AS "SerialMdvr",
	COALESCE(serial_go, 'N/A') AS "SerialGo",
	COALESCE(serial_lytx, 'N/A') AS "SerialLytx",
	COALESCE(COALESCE(TO_JSON(ARRAY_AGG(c)), '[]')) AS "Channels",
	f.name AS "Group"
FROM
(
	SELECT
	vehicle_id,
	MAX(serial) FILTER (WHERE device_id = 2) AS serial_mdvr,
	MAX(serial) FILTER (WHERE device_id = 1) AS serial_go,
	MAX(serial) FILTER (WHERE device_id = 3) AS serial_lytx
	FROM vehicle_device
	GROUP BY vehicle_id
) AS dt
INNER JOIN vehicle AS v
ON dt.vehicle_id = v.id
INNER JOIN fleet AS f
ON f.id = v.idfleet
LEFT JOIN 
(
	SELECT c.idvehicle,
	ct.name AS "cameraType", c.channel AS "channel",
	c.name AS "channelName"
	FROM camera AS c
	INNER JOIN camera_type AS ct
	ON c.camera_type_id = ct.camera_type_id
) AS c
ON dt.vehicle_id = c.idvehicle
GROUP BY serial_mdvr, serial_go, serial_lytx, f.name;