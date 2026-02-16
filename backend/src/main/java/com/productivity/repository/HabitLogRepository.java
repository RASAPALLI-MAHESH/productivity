package com.productivity.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.productivity.model.HabitLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class HabitLogRepository {

    private static final Logger log = LoggerFactory.getLogger(HabitLogRepository.class);
    private final Firestore firestore;

    public HabitLogRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference getCollection(String userId, String habitId) {
        return firestore.collection("users").document(userId)
                .collection("habits").document(habitId).collection("logs");
    }

    public HabitLog save(String userId, String habitId, HabitLog habitLog) throws ExecutionException, InterruptedException {
        getCollection(userId, habitId).document(habitLog.getDate()).set(habitLog.toMap()).get();
        log.info("HabitLog saved: date={} habit={} user={}", habitLog.getDate(), habitId, userId);
        return habitLog;
    }

    public Optional<HabitLog> findByDate(String userId, String habitId, String date) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = getCollection(userId, habitId).document(date).get().get();
        if (doc.exists()) {
            return Optional.of(new HabitLog(doc.getData(), doc.getId()));
        }
        return Optional.empty();
    }

    public List<HabitLog> findByDateRange(String userId, String habitId, String startDate, String endDate)
            throws ExecutionException, InterruptedException {
        Query query = getCollection(userId, habitId)
                .whereGreaterThanOrEqualTo(FieldPath.documentId(), startDate)
                .whereLessThanOrEqualTo(FieldPath.documentId(), endDate);

        List<HabitLog> logs = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {
            logs.add(new HabitLog(doc.getData(), doc.getId()));
        }
        return logs;
    }
}
