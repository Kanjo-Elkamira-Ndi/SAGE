/// SAGE user roles. Matches the `users.role` enum in the database schema.
enum Role {
  student,
  lecturer,
  admin;

  static Role fromApi(String value) {
    return switch (value) {
      'student' => Role.student,
      'lecturer' => Role.lecturer,
      'admin' => Role.admin,
      _ => throw ArgumentError('Unknown role: $value'),
    };
  }
}

/// Authenticated user. Mirrors `users` table fields exposed via `/auth/me`.
class User {
  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
    this.departmentName,
  });

  final String id;
  final String email;
  final String fullName;
  final Role role;
  final String? avatarUrl;
  final String? departmentName;

  String get initials {
    final parts = fullName.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  factory User.fromApi(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: Role.fromApi(json['role'] as String),
      avatarUrl: json['avatarUrl'] as String?,
      departmentName: json['departmentName'] as String?,
    );
  }
}
