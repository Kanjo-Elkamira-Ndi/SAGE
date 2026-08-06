import '../../../core/api_client.dart';
import '../../models/api/performance.dart';

/// Student performance endpoints from the shared contract
/// (`api-wiring-plan.md` §A.2): `GET /performance/me` and
/// `GET /performance/me/risk`.
class ApiPerformanceRepository {
  ApiPerformanceRepository({required this.client});

  final ApiClient client;

  Future<ApiStudentPerformance> me() async {
    final data = await client.get('/performance/me');
    return ApiStudentPerformance.fromJson(data as Map<String, dynamic>);
  }

  Future<ApiRiskDetail> myRisk() async {
    final data = await client.get('/performance/me/risk');
    return ApiRiskDetail.fromJson(data as Map<String, dynamic>);
  }

  /// `GET /performance/courses/:id` (lecturer only) — aggregates + students.
  Future<ApiCoursePerformance> coursePerformance(String courseId) async {
    final data = await client.get('/performance/courses/$courseId');
    return ApiCoursePerformance.fromJson(data as Map<String, dynamic>);
  }
}
