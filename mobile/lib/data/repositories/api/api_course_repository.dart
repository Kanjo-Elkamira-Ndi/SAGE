import '../../../core/api_client.dart';
import '../../../core/pagination.dart';
import '../../models/api/course.dart';

/// Course endpoints from the shared contract (`api-wiring-plan.md` §A.2):
/// `GET /courses` (enrolled for students, owned for lecturers) and
/// `GET /courses/:id`.
class ApiCourseRepository {
  ApiCourseRepository({required this.client});

  final ApiClient client;

  Future<Page<ApiCourse>> listCourses({int page = 1, int? limit}) async {
    final data = await client.get(
      '/courses',
      query: paginationParams(page: page, limit: limit),
    );
    return Page.fromJson(data as Map<String, dynamic>, ApiCourse.fromJson);
  }

  Future<ApiCourse> getCourse(String id) async {
    final data = await client.get('/courses/$id');
    return ApiCourse.fromJson(data as Map<String, dynamic>);
  }

  Future<ApiCourse> createCourse({
    required String code,
    required String title,
    String? description,
    String? semester,
    int? creditUnits,
    String? outline,
  }) async {
    final data = await client.post('/courses', body: {
      'code': code,
      'title': title,
      'description': description,
      'semester': semester,
      'creditUnits': creditUnits,
      'outline': outline,
    });
    return ApiCourse.fromJson(data as Map<String, dynamic>);
  }

  Future<ApiCourse> updateCourse(
    String id, {
    String? title,
    String? description,
    String? semester,
    int? creditUnits,
    String? outline,
  }) async {
    final data = await client.patch('/courses/$id', body: {
      'title': title,
      'description': description,
      'semester': semester,
      'creditUnits': creditUnits,
      'outline': outline,
    });
    return ApiCourse.fromJson(data as Map<String, dynamic>);
  }

  Future<void> enroll(String id) async {
    await client.post('/courses/$id/enroll');
  }
}
