connection.query(qr, (error, rows) => {
                    if (error) {
                        console.log(error);
                    } else {
                        if (rows.length){
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+- SORTING BY GEOGRAPHIC AREA -+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                            if (sort == 'Geoographic Area'){
                                var connected_pos = new GeoPoint(connected.lat, connected.lng);
                                var min = 12756;
                                var index;
                                for (var i = 0; i < rows.length; i++) {
                                    match_pos = new GeoPoint(rows[i].lat, rows[i].lng);
                                    if (connected.lat == rows[i].lat && connected.lng == rows[i].lng)
                                        distance = 0;
                                    else
                                        distance = connected_pos.distanceTo(match_pos, true);
                                    if (distance < min){
                                        min = distance;
                                        index = i;
                                    }
                                }
                                min = min.toFixed(2);
                                if (min < 1)
                                    min = 'Less than a ';
                                row = rows[index];
                                row.distance = min;
                                connection.query("SELECT label FROM tag \
                                                INNER JOIN user_tag \
                                                ON tag.id = user_tag.id_tag \
                                                WHERE id_user = ?;", row.id, (error, user_tags) => {
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        final_tags = '';
                                                        for (let j = 0; j < user_tags.length; j++) {
                                                            final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                                        }
                                                        res.render('match', { title: 'Match', row, session, sort, order, filter, val0, val1, final_tags});
                                                    }
                                                });
                            }
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+- SORTING BY FAME RATING -+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */ 
                            else if (sort == 'Fame Rating'){
                                var connected_pos = new GeoPoint(connected.lat, connected.lng);
                                var max = -1;
                                var dis = 0;
                                var index;
                                for (var i = 0; i < rows.length; i++) {
                                    match_pos = new GeoPoint(rows[i].lat, rows[i].lng);
                                    if (connected.lat == rows[i].lat && connected.lng == rows[i].lng)
                                        distance = 0;
                                    else
                                        distance = connected_pos.distanceTo(match_pos, true);
                                    if (rows[i].rating > max){
                                        max = rows[i].rating;
                                        index = i;
                                        dis = distance;
                                    }
                                }
                                dis = dis.toFixed(2);
                                if (dis < 1)
                                    dis = 'Less than a ';
                                row = rows[index];
                                row.distance = dis;
                                connection.query("SELECT label FROM tag \
                                                INNER JOIN user_tag \
                                                ON tag.id = user_tag.id_tag \
                                                WHERE id_user = ?;", row.id, (error, user_tags) => {
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        final_tags = '';
                                                        for (let j = 0; j < user_tags.length; j++) {
                                                            final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                                        }
                                                        res.render('match', { title: 'Match', row, session, sort, order, filter, val0, val1, final_tags});
                                                    }
                                                });
                            }
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+- SORTING BY COMMON TAGS -+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */
                                                                /* -+-+-+-+-+--+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- */ 
                            else {
                                var connected_pos = new GeoPoint(connected.lat, connected.lng);
                                var common_tags;
                                var common_tagsfinal = '';
                                var count_tags = 0;
                                var dis = 0;
                                var index;
                                for (let i = 0; i < rows.length; i++) {
                                    match_pos = new GeoPoint(rows[i].lat, rows[i].lng);
                                    if (connected.lat == rows[i].lat && connected.lng == rows[i].lng)
                                        distance = 0;
                                    else
                                        distance = connected_pos.distanceTo(match_pos, true);

                                    qr = "SELECT id_tag, tag.label, COUNT(*) AS count \
                                                    FROM user_tag INNER JOIN tag on tag.id = user_tag.id_tag \
                                                    WHERE user_tag.id_user = ? \
                                                    OR user_tag.id_user = ? \
                                                    GROUP BY id_tag \
                                                    HAVING count > 1 \
                                                    ORDER BY count DESC";
                                    connection.query(qr, [ connected.id, rows[i].id ], (error, tags) => {
                                        if (error) {
                                            console.log(error);
                                        }
                                        if (tags.length >= count_tags) {
                                            common_tags = tags;
                                            count_tags = tags.length;
                                            index = i;
                                        }
                                        if (i == rows.length - 1)
                                        {
                                            dis = distance;
                                            dis = dis.toFixed(2);
                                            if (dis < 1)
                                                dis = 'Less than a ';
                                            row = rows[index];
                                            row.distance = dis;
                                            connection.query("SELECT label FROM tag \
                                                INNER JOIN user_tag \
                                                ON tag.id = user_tag.id_tag \
                                                WHERE id_user = ?;", row.id, (error, user_tags) => {
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        final_tags = '';
                                                        for (let j = 0; j < user_tags.length; j++) {
                                                            final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                                        }
                                                        common_tagsfinal = '';
                                                        for (let k = 0; k < common_tags.length; k++) {
                                                            common_tagsfinal = common_tagsfinal.concat('#', common_tags[k].label, " ");
                                                        }
                                                    }
                                                    res.render('match', { title: 'Match', row, session, sort, order, filter, val0, val1, final_tags, common_tagsfinal});
                                                });
                                        }
                                    });
                                }
                            }
                        } else
                            res.redirect('405'); //No user found
                    }
                });